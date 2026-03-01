import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, query, orderBy
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export const fetchPatientsAction = () => async (dispatch) => {
  dispatch({ type: 'PATIENTS_LOADING' });
  try {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    dispatch({ type: 'PATIENTS_LOADED', payload: patients });
  } catch (error) {
    dispatch({ type: 'PATIENTS_ERROR', payload: error.message });
  }
};

export const addPatientAction = (patientData, currentUserId) => async (dispatch) => {
  try {
    const data = {
      ...patientData,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'patients'), data);
    dispatch({ type: 'PATIENT_ADDED', payload: { id: docRef.id, ...data } });
    return docRef.id;
  } catch (error) {
    dispatch({ type: 'PATIENTS_ERROR', payload: error.message });
    throw error;
  }
};

export const updatePatientAction = (patientId, updatedData) => async (dispatch) => {
  try {
    await updateDoc(doc(db, 'patients', patientId), updatedData);
    dispatch({ type: 'PATIENT_UPDATED', payload: { id: patientId, ...updatedData } });
  } catch (error) {
    dispatch({ type: 'PATIENTS_ERROR', payload: error.message });
    throw error;
  }
};

export const deletePatientAction = (patientId) => async (dispatch) => {
  try {
    await deleteDoc(doc(db, 'patients', patientId));
    dispatch({ type: 'PATIENT_DELETED', payload: patientId });
  } catch (error) {
    dispatch({ type: 'PATIENTS_ERROR', payload: error.message });
    throw error;
  }
};
