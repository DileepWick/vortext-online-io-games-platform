export const getUserRoleFromToken = (token) => {
  if (!token) return null;

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decodedToken = JSON.parse(jsonPayload);
    if (!decodedToken.user || !decodedToken.user.role) {
      throw new Error("Invalid token payload");
    }

    return decodedToken.user.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
