import { useEffect, useReducer, useRef } from 'react';
import { initialTaskState } from './initialTaskState';
import { taskReducer } from './taskReducer';
import { TaskContext } from './TaskContext';
import { TimerWorkerManager } from '../../workers/TimerWorkerManager';
import { TaskActionTypes } from './taskActions';
import { loadBeep } from '../../utils/loadBeep';
import type { TaskStateModel } from '../../models/TaskStateModel';
import { chronosApi } from '../../services/chronosApi';
import { useAuth } from '../AuthContext';

type TaskContextProviderProps = {
  children: React.ReactNode;
};

export function TaskContextProvider({ children }: TaskContextProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  const playBeepRef = useRef<ReturnType<typeof loadBeep> | null>(null);
  const activeTaskRef = useRef(state.activeTask);

  const worker = TimerWorkerManager.getInstance();

  useEffect(() => {
    activeTaskRef.current = state.activeTask;
  }, [state.activeTask]);

  useEffect(() => {
    async function loadApiState() {
      if (!isAuthenticated) {
        dispatch({ type: TaskActionTypes.RESET_STATE });
        return;
      }

      try {
        const [settings, tasks] = await Promise.all([
          chronosApi.getSettings(),
          chronosApi.getTasks(),
        ]);

        dispatch({
          type: TaskActionTypes.CHANGE_SETTINGS,
          payload: settings,
        });
        dispatch({
          type: TaskActionTypes.SET_TASKS,
          payload: tasks,
        });
      } catch {
        const storageState = localStorage.getItem(`state:${user?.id ?? 'anonymous'}`);

        if (storageState) {
          dispatch({
            type: TaskActionTypes.SET_TASKS,
            payload: (JSON.parse(storageState) as TaskStateModel).tasks,
          });
        }
      }
    }

    loadApiState();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    worker.onmessage(e => {
      const countDownSeconds = e.data;

      if (countDownSeconds <= 0) {
        const activeTask = activeTaskRef.current;

        if (playBeepRef.current) {
          playBeepRef.current();
          playBeepRef.current = null;
        }
        if (activeTask) {
          chronosApi.completeTask(activeTask.id).catch(() => null);
        }
        dispatch({
          type: TaskActionTypes.COMPLETE_TASK,
        });
        worker.terminate();
      } else {
        dispatch({
          type: TaskActionTypes.COUNT_DOWN,
          payload: { secondsRemaining: countDownSeconds },
        });
      }
    });
  }, [worker]);

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`state:${user.id}`, JSON.stringify(state));
    }

    if (!state.activeTask) {
      worker.terminate();
    }

    document.title = `${state.formattedSecondsRemaining} - Chronos Pomodoro`;

    worker.postMessage(state);
  }, [worker, state]);

  useEffect(() => {
    if (state.activeTask && playBeepRef.current === null) {
      playBeepRef.current = loadBeep();
    } else {
      playBeepRef.current = null;
    }
  }, [state.activeTask]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}
