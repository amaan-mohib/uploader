import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from "./firebaseConfig";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});
export const login = async () => {
  await signInWithPopup(auth, provider)
    .then((res) => {
      // console.log(res);
      // user.set(res.user);
      logEvent(analytics, "google_signin");
      console.debug("signed in", res);
    })
    .catch((err) => console.error(err));
};

//Firestore
export const db = getFirestore();

//Storage
const storage = getStorage(app);
export const storageRef = ref(storage);
