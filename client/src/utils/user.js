/** Normalize API user payloads so `id` and `_id` are always available. */
export const normalizeUser = (user) => {
  if (!user) return null;
  const id = String(user.id ?? user._id ?? "");
  return {
    ...user,
    id,
    _id: id,
    username: user.username ?? "",
    email: user.email ?? "",
    avatar: user.avatar ?? "",
  };
};
