import { TaskAPI } from "@/services/TaskAPI";
import { AppDispatch, RootState } from "@/store";
import { setTasks } from "@/store/taskSlice";
import { getErrorMessage } from "@/utils/helper";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const useTask = (projectId: string) => {
  const dispatch: AppDispatch = useDispatch();
  const { tasks } = useSelector((state: RootState) => state.task);

  const [isTaskLoading, setIsTaskLoading] = useState(false);

  const getTasks = async (isLoading = true) => {
    try {
      setIsTaskLoading(isLoading);
      const response = await TaskAPI.getTasks(projectId);
      if (response.success) {
        dispatch(
          setTasks({
            projectId,
            tasks: response.data,
          })
        );
      } else {
        toast.error(response.message || "Failed to fetch tasks");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsTaskLoading(false);
    }
  };

  return {
    tasks: tasks?.[projectId] || [],
    isTaskLoading,
    getTasks,
  };
};

export default useTask;
