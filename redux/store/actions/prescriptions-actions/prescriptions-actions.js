import {
  collection, addDoc, getDocs, query, orderBy
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export const fetchPrescriptionsAction = () => async (dispatch) => {
  dispatch({ type: 'PRESCRIPTIONS_LOADING' });
  try {
    const q = query(collection(db, 'prescriptions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const prescriptions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    dispatch({ type: 'PRESCRIPTIONS_LOADED', payload: prescriptions });
  } catch (error) {
    dispatch({ type: 'PRESCRIPTIONS_ERROR', payload: error.message });
  }
};

export const addPrescriptionAction = (prescriptionData) => async (dispatch) => {
  try {
    const data = {
      ...prescriptionData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'prescriptions'), data);
    await addDoc(collection(db, 'diagnosisLogs'), {
      patientId: data.patientId,
      appointmentId: data.appointmentId,
      diagnosis: data.diagnosis,
      symptoms: data.symptoms || '',
      riskLevel: data.riskLevel || 'low',
      createdAt: data.createdAt,
    });
    dispatch({ type: 'PRESCRIPTION_ADDED', payload: { id: docRef.id, ...data } });
    return docRef.id;
  } catch (error) {
    dispatch({ type: 'PRESCRIPTIONS_ERROR', payload: error.message });
    throw error;
  }
};
