const API_URL = "http://localhost/Sociatech/backend/auth";

const handleResponse = async (response) => {
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      console.error("Error parsing JSON:", error);

      throw new Error(text || "Server returned non-JSON response");
    }
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};
export const signUpWithEmail = async (email, password, fullname, username) => {
  try {
    const response = await fetch(`${API_URL}/signup.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
        fullname,
        username: username || email.split("@")[0],
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Throw error if login was not successful
    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    // Only store user info if login succeeded
    localStorage.setItem("userData", JSON.stringify(data.data.user));

    return data;
  } catch (error) {
    console.error("Login service error:", error);
    throw error;
  }
};


export const googleAuth = async (user) => {
  try {
    const response = await fetch(`${API_URL}/google-auth.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        google_id: user.uid,
        email: user.email,
        fullname: user.displayName || user.email.split("@")[0],
        username: user.email.split("@")[0],
        profile_image: user.photoURL || "default_pfp.png",
      }),
    });

    const data = await handleResponse(response);

    return {
      user: data.data.user,
      rememberMe: data.data.rememberMe ?? true,
    };
  } catch (error) {
    console.error("Google auth error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await fetch(`${API_URL}/logout.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("userData");
  }
};

export const verifySession = async () => {
  try {
    const response = await fetch(`${API_URL}/verify.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Session verification error:", error);
    localStorage.removeItem("userData");
    throw error;
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/forgot-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};

export const resetPassword = async (new_password, confirm_password, token) => {
  try {
    const response = await fetch(`${API_URL}/reset-password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        new_password: new_password,
        confirmPassword: confirm_password,
        token: token,
      }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const createPost = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/createPost.php`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Create post error:", error);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await fetch(`${API_URL}/verify-email.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: token }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }
    return data;
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
};

export const sendVerificationEmail = async (email) => {
  try {
    const response = await fetch(`${API_URL}/send-verification-email.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Send verification email error:", error);
    throw error;
  }
};

// Update your saveDraft function to use the API_URL constant:

export async function saveDraft(formData) {
  try {
    const response = await fetch(`http://localhost/Sociatech/backend/auth/saveDraft.php`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in saveDraft:", error);
    throw error;
  }
};
