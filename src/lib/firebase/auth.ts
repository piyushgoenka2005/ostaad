import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./client";
import { UserProfile } from "@/types";

/**
 * Creates or updates user profile in Firestore
 */
export async function syncUserProfile(user: User, additionalData: Partial<UserProfile> = {}): Promise<UserProfile | null> {
  if (!user) return null;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || additionalData.displayName || "Ostaad User",
      email: user.email || "",
      role: additionalData.role || "Homeowner / Builder",
      phone: additionalData.phone || user.phoneNumber || "",
      pincode: additionalData.pincode || "",
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
    return profile;
  } else {
    const updatePayload: Record<string, unknown> = {
      lastLoginAt: serverTimestamp(),
    };
    if (additionalData.phone) updatePayload.phone = additionalData.phone;
    if (additionalData.pincode) updatePayload.pincode = additionalData.pincode;
    await updateDoc(userRef, updatePayload);
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.data() as UserProfile;
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpUser(
  name: string,
  email: string,
  pass: string,
  role: string = "Homeowner / Builder",
  phone: string = "",
  pincode: string = ""
) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    await updateProfile(user, { displayName: name });
    const profile = await syncUserProfile(user, { displayName: name, role, phone, pincode });
    return { success: true, user, profile };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return { success: false, error: formatAuthError(err) };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInUser(email: string, pass: string) {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCred.user;
    const profile = await syncUserProfile(user);
    return { success: true, user, profile };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return { success: false, error: formatAuthError(err) };
  }
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(role: string = "Homeowner / Builder") {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const profile = await syncUserProfile(user, { role });
    return { success: true, user, profile };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return { success: false, error: formatAuthError(err) };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset link sent to your email." };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    return { success: false, error: formatAuthError(err) };
  }
}

/**
 * Listen to Auth state changes
 */
export function onAuthStateChange(
  callback: (data: { isAuthenticated: boolean; user: User | null; profile: UserProfile | null }) => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const profile = snap.exists()
        ? (snap.data() as UserProfile)
        : ({ uid: user.uid, email: user.email || "", displayName: user.displayName || "Ostaad User", role: "Homeowner" } as UserProfile);
      callback({ isAuthenticated: true, user, profile });
    } else {
      callback({ isAuthenticated: false, user: null, profile: null });
    }
  });
}

function formatAuthError(error: { code?: string; message?: string }) {
  const code = error.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/invalid-email":
      return "Please provide a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completion.";
    case "auth/too-many-requests":
      return "Access temporarily blocked due to multiple failed attempts. Please reset password or try later.";
    default:
      return error.message || "An error occurred during authentication.";
  }
}
