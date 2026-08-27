import axios from 'axios';
import { GarminSession, WORKOUT_URL, SCHEDULE_URL } from './garminAuth';

export async function crearWorkout(session: GarminSession, workout: object): Promise<{ workoutId: string | number }> {
  const resp = await axios.post(WORKOUT_URL, workout, {
    headers: {
      Authorization: `Bearer ${session.oauth2.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  return resp.data;
}

export async function programarWorkout(session: GarminSession, workoutId: string | number, fechaISO: string): Promise<void> {
  await axios.post(
    SCHEDULE_URL(workoutId),
    { date: fechaISO },
    {
      headers: {
        Authorization: `Bearer ${session.oauth2.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
