import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { AuthAPI } from "../services/AuthAPI";
import { resetUserSlice, setUserDetails } from "../store/userSlice";
import { getErrorMessage } from "../utils/helper";
import toast from "react-hot-toast";

const useUser = () => {
  const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const getUserDetails = async () => {
    try {
      const response = await AuthAPI.me();
      if (response.success) {
        dispatch(setUserDetails(response.data));
      } else {
        toast.error(response.message || "Failed to fetch user details");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const logout = () => {
    dispatch(resetUserSlice());
  };

  return {
    ...user,
    getUserDetails,
    logout,
  };
};

export default useUser;
