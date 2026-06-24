import { GoogleLogin } from "@react-oauth/google";

const GoogleButton = ({ onSuccess , onError}) => {
  return (
    <>
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        useOneTap={false}
        theme="filled_black"
        size="large"
        width="400"
        text="continue_with"
        shape="rectangular"
      />
    </div>
    </>
  );
};

export default GoogleButton;