// ============================================================
// OSTAAD — FIREBASE INITIALIZATION, AUTH & FIRESTORE CLIENT
// Firebase v10 Modular SDK via Google CDN
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  GoogleAuthProvider, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc,
  onSnapshot,
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration for Ostaad
const firebaseConfig = {
  apiKey: "AIzaSyDh2uFMNAxRCsnOS5FWT2YZlV-bTVeyH7w",
  authDomain: "ostaad-a2be6.firebaseapp.com",
  projectId: "ostaad-a2be6",
  storageBucket: "ostaad-a2be6.firebasestorage.app",
  messagingSenderId: "92661766730",
  appId: "1:92661766730:web:0a75ddeeb9699d211124b3",
  measurementId: "G-W8J57GMYNV"
};

// Initialize App, Auth and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Ensure anonymous session for database read/writes if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch(() => {});
  }
});

/**
 * Creates or updates user profile in Firestore
 */
async function syncUserProfile(user, additionalData = {}) {
  if (!user) return null;
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const profile = {
      uid: user.uid,
      displayName: user.displayName || additionalData.name || "Ostaad User",
      email: user.email,
      role: additionalData.role || "Homeowner / Builder",
      phone: additionalData.phone || user.phoneNumber || "",
      pincode: additionalData.pincode || "",
      photoURL: user.photoURL || null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    await setDoc(userRef, profile);
    return profile;
  } else {
    const updatePayload = {
      lastLoginAt: serverTimestamp()
    };
    if (additionalData.phone) updatePayload.phone = additionalData.phone;
    if (additionalData.pincode) updatePayload.pincode = additionalData.pincode;
    await updateDoc(userRef, updatePayload);
    const updatedSnap = await getDoc(userRef);
    return updatedSnap.data();
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpUser(name, email, password, role = "Homeowner / Builder", phone = "", pincode = "") {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set display name in Auth
    await updateProfile(user, { displayName: name });
    
    // Create Firestore document with phone and pincode
    const profile = await syncUserProfile(user, { name, role, phone, pincode });
    return { success: true, user, profile };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profile = await syncUserProfile(user);
    return { success: true, user, profile };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

export const loginUser = signInUser;

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(role = "Homeowner / Builder") {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const profile = await syncUserProfile(user, { role });
    return { success: true, user, profile };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset link sent to your email." };
  } catch (error) {
    return { success: false, error: formatAuthError(error) };
  }
}

/**
 * Listen to Auth state changes
 */
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const profile = snap.exists() ? snap.data() : { uid: user.uid, email: user.email, displayName: user.displayName };
      callback({ isAuthenticated: true, user, profile });
    } else {
      callback({ isAuthenticated: false, user: null, profile: null });
    }
  });
}

/**
 * Store a BOQ Request in Firestore under users/{uid}/boq_requests and global boq_requests
 */
export async function saveUserBOQ(boqData) {
  try {
    const currentUser = auth.currentUser;
    const timestamp = serverTimestamp();
    const payload = {
      ...boqData,
      status: "Pending Engineering Audit",
      createdAt: timestamp,
      userId: currentUser ? currentUser.uid : "anonymous",
      userEmail: currentUser ? currentUser.email : (boqData.email || "anonymous")
    };

    // Save to global collection
    const globalRef = await addDoc(collection(db, "boq_requests"), payload);

    // If logged in, also record in user's subcollection
    if (currentUser) {
      await setDoc(doc(db, "users", currentUser.uid, "boq_requests", globalRef.id), {
        ...payload,
        requestId: globalRef.id
      });
    }

    return { success: true, id: globalRef.id };
  } catch (error) {
    console.error("Firestore BOQ save error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to turn Firebase error codes into clean user-friendly messages
 */
function formatAuthError(error) {
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

/**
 * Save product to Firestore database
 */
export async function saveProductToFirestore(product) {
  try {
    const docId = product.id || ("prod_" + Date.now());
    const prodRef = doc(db, "products", docId);
    const dataToSave = {
      ...product,
      id: docId,
      isDeleted: false,
      lastUpdated: Date.now()
    };
    await setDoc(prodRef, dataToSave, { merge: true });
    return { success: true, id: docId };
  } catch (error) {
    console.error("Firestore product save error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete product from Firestore database (Hard delete + Soft delete flag)
 */
export async function deleteProductFromFirestore(productId) {
  try {
    const prodRef = doc(db, "products", productId);
    // 1. Mark as deleted so real-time listeners drop it immediately
    try {
      await setDoc(prodRef, { isDeleted: true, status: "deleted", deletedAt: Date.now() }, { merge: true });
    } catch(e) {
      console.warn("Soft delete mark warning:", e);
    }
    // 2. Also delete document
    await deleteDoc(prodRef);
    return { success: true };
  } catch (error) {
    console.error("Firestore product delete error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Real-time listener for Firestore products
 */
export function subscribeToProducts(onDataCallback) {
  try {
    const prodCol = collection(db, "products");
    return onSnapshot(prodCol, (snapshot) => {
      const prods = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.isDeleted && data.status !== "deleted") {
          prods.push({ id: docSnap.id, ...data });
        }
      });
      if (typeof onDataCallback === "function") {
        onDataCallback(prods);
      }
    }, (error) => {
      console.warn("Firestore product snapshot error:", error);
    });
  } catch (e) {
    console.warn("Failed to subscribe to Firestore products:", e);
    return null;
  }
}

/**
 * Fetch all products from Firestore once
 */
export async function fetchProductsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "products"));
    const prods = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isDeleted && data.status !== "deleted") {
        prods.push({ id: docSnap.id, ...data });
      }
    });
    return prods;
  } catch (e) {
    console.warn("Failed to fetch products from Firestore:", e);
    return [];
  }
}

// Expose on global window object for universal availability across vanilla scripts
window.OstaadAuth = {
  auth,
  db,
  signUpUser,
  signInUser,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  onAuthStateChange,
  saveUserBOQ,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToProducts,
  fetchProductsFromFirestore
};

export { auth, db };
