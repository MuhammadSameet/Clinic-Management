import {
  collection, addDoc, getDocs, doc,
  updateDoc, query, orderBy
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export const fetchAppointmentsAction = () => async (dispatch) => {
  dispatch({ type: 'APPOINTMENTS_LOADING' });
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const appointments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    dispatch({ type: 'APPOINTMENTS_LOADED', payload: appointments });
  } catch (error) {
    dispatch({ type: 'APPOINTMENTS_ERROR', payload: error.message });
  }
};

export const bookAppointmentAction = (appointmentData, currentUserId) => async (dispatch) => {
  try {
    const data = {
      ...appointmentData,
      status: 'pending',
      bookedBy: currentUserId,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'appointments'), data);
    dispatch({ type: 'APPOINTMENT_ADDED', payload: { id: docRef.id, ...data } });
    return docRef.id;
  } catch (error) {
    dispatch({ type: 'APPOINTMENTS_ERROR', payload: error.message });
    throw error;
  }
};

export const updateAppointmentStatusAction = (appointmentId, status) => async (dispatch) => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), { status });
    dispatch({ type: 'APPOINTMENT_STATUS_UPDATED', payload: { id: appointmentId, status } });
  } catch (error) {
    dispatch({ type: 'APPOINTMENTS_ERROR', payload: error.message });
    throw error;
  }
};
