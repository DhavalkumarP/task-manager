import { ProjectAPI } from "@/services/ProjectAPI";
import { AppDispatch, RootState } from "@/store";
import { setProjects } from "@/store/projectSlice";
import { getErrorMessage } from "@/utils/helper";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const useProject = () => {
  const dispatch: AppDispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);

  const [isProjectLoading, setIsProjectLoading] = useState(false);

  const getProjects = async (isLoading = true) => {
    try {
      setIsProjectLoading(isLoading);
      const response = await ProjectAPI.getProjects();
      if (response.success) {
        dispatch(setProjects(response.data));
      } else {
        toast.error(response.message || "Failed to fetch projects");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsProjectLoading(false);
    }
  };

  return {
    ...project,
    isProjectLoading,
    getProjects,
  };
};

export default useProject;
