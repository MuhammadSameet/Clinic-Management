// Auth actions are defined here...!

export const loginAction = (email, password) => async (dispatch) => {
  dispatch({ type: 'AUTH_LOADING' });
  try {
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');

    const auth = getAuth();
    const db = getFirestore();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('User not found in database');
    }

    const userData = { id: userDoc.id, ...userDoc.data() };
    dispatch({ type: 'AUTH_SUCCESS', payload: userData });
    return userData;
  } catch (error) {
    let errorMessage = 'Login failed';
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    throw new Error(errorMessage);
  }
};

export const logoutAction = () => async (dispatch) => {
  try {
    const { getAuth, signOut } = await import('firebase/auth');
    const auth = getAuth();
    await signOut(auth);
    dispatch({ type: 'AUTH_LOGOUT' });
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const createUserAction = (userData) => async (dispatch) => {
  try {
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    const auth = getAuth();
    const db = getFirestore();

    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    const firestoreData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      specialty: userData.specialty || '',
      createdAt: new Date().toISOString(),
    };

    if (userData.phone) firestoreData.phone = userData.phone;
    if (userData.age) firestoreData.age = userData.age;
    if (userData.gender) firestoreData.gender = userData.gender;

    await setDoc(doc(db, 'users', userCredential.user.uid), firestoreData);

    // If patient, also create patient document
    if (userData.role === 'patient') {
      await setDoc(doc(db, 'patients', userCredential.user.uid), {
        ...firestoreData,
        createdBy: userCredential.user.uid,
      });
    }

    return { id: userCredential.user.uid, ...firestoreData };
  } catch (error) {
    let errorMessage = 'Signup failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password must be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    throw new Error(errorMessage);
  }
};

export const registerPatientAction = (formData) => async (dispatch) => {
  dispatch({ type: 'AUTH_LOADING' });
  try {
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    const auth = getAuth();
    const db = getFirestore();

    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      age: parseInt(formData.age),
      gender: formData.gender,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    await setDoc(doc(db, 'patients', userCredential.user.uid), {
      ...userData,
      createdBy: userCredential.user.uid,
    });

    const fullUserData = { id: userCredential.user.uid, ...userData };
    dispatch({ type: 'AUTH_SUCCESS', payload: fullUserData });
    return fullUserData;
  } catch (error) {
    let errorMessage = 'Signup failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password must be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    throw new Error(errorMessage);
  }
};

export const checkAuthState = () => async (dispatch) => {
  try {
    const { getAuth, onAuthStateChanged } = await import('firebase/auth');
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');

    const auth = getAuth();
    const db = getFirestore();

    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() };
            dispatch({ type: 'AUTH_SUCCESS', payload: userData });
            dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: userData, isAuthenticated: true } });
            dispatch({ type: 'AUTH_CHECKED' });
            resolve(userData);
          } else {
            dispatch({ type: 'AUTH_LOGOUT' });
            dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: null, isAuthenticated: false } });
            dispatch({ type: 'AUTH_CHECKED' });
            resolve(null);
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
          dispatch({ type: 'UPDATE_AUTH_STATE', payload: { currentUser: null, isAuthenticated: false } });
          dispatch({ type: 'AUTH_CHECKED' });
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Auth state check error:', error);
    dispatch({ type: 'AUTH_LOGOUT' });
    return null;
  }
};

export const resetPasswordAction = (email) => async () => {
  try {
    const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = 'Failed to send reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email';
    }
    throw new Error(errorMessage);
  }
};
