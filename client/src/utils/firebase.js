import { initializeApp } from "firebase/app";
// import { getAnalytics, logEvent } from "firebase/analytics";
import firebaseConfig from "./firebaseConfig";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, collection } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const GHprovider = new GithubAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});
GHprovider.setCustomParameters({
  prompt: "select_account",
});
export const login = async () => {
  await signInWithPopup(auth, provider)
    .then((res) => {
      // logEvent(analytics, "google_signin");
      console.debug("signed in", res);
    })
    .catch((err) => console.error(err));
};
export const loginGH = async () => {
  await signInWithPopup(auth, GHprovider)
    .then((res) => {
      // logEvent(analytics, "github_signin");
      console.debug("signed in", res);
    })
    .catch((err) => console.error(err));
};

export const logout = () => {
  signOut(auth).catch((err) => console.error(err));
};

//Firestore
export const db = getFirestore();
export const createDocRef = (ref) => doc(collection(db, ref));
export const createOnlyDocRef = (ref) => doc(db, ref);
export const createCollectionRef = (ref) => collection(db, ref);

//Storage
const storage = getStorage(app);
export const createStorageRef = (path) => ref(storage, path);
