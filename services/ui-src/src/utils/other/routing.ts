// navigate to path from clicked link if exists
export const getReturnUrl = () => {
  const returnUrl = localStorage.getItem("ReturnURL") ?? "/";
  localStorage.removeItem("ReturnURL");
  return returnUrl;
};
