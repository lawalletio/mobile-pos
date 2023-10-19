import {StackActions, useNavigation} from '@react-navigation/native';
import {Routes} from '../navigators/routes';

const useNavigate = () => {
  const {navigate, goBack, dispatch} = useNavigation();
  const {replace} = StackActions;

  return {
    navigate: (route: Routes, params?: any) =>
      navigate(route as never, params as never),
    goBack,
    dispatch: (route: Routes, params?: any) => dispatch(replace(route, params)),
  };
};

export default useNavigate;
