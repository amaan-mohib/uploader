package com.example.uploader

import android.app.Activity.RESULT_OK
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.addCallback
import androidx.fragment.app.viewModels
import androidx.navigation.NavController
import androidx.navigation.fragment.findNavController
import com.example.uploader.databinding.FragmentLoginBinding
import com.example.uploader.viewmodels.LoginViewModel
import com.firebase.ui.auth.AuthUI
import com.firebase.ui.auth.FirebaseAuthUIActivityResultContract
import com.firebase.ui.auth.data.model.FirebaseAuthUIAuthenticationResult
import com.google.android.material.snackbar.Snackbar
import com.google.firebase.auth.FirebaseAuth

class LoginFragment : Fragment() {

  companion object {
    const val TAG = "LoginFragment"
  }

  private val viewModel by viewModels<LoginViewModel>()
  private lateinit var navController: NavController
//  override fun onCreate(savedInstanceState: Bundle?) {
//    super.onCreate(savedInstanceState)
//    arguments?.let {
//      param1 = it.getString(ARG_PARAM1)
//      param2 = it.getString(ARG_PARAM2)
//    }
//  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    val binding = FragmentLoginBinding.inflate(inflater)

    binding.loginBtn.setOnClickListener { launchSignInFlow() }

    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    navController = findNavController()

    requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
      navController.popBackStack(R.id.mainFragment, false)
    }

    viewModel.authenticationState.observe(viewLifecycleOwner, { authenticationState ->
      when (authenticationState) {
//        LoginViewModel.AuthenticationState.AUTHENTICATED -> navController.popBackStack()
        LoginViewModel.AuthenticationState.INVALID_AUTHENTICATION -> Snackbar.make(
          view, requireActivity().getString(R.string.login_unsuccessful_msg), Snackbar.LENGTH_LONG
        ).show()
        else -> Log.e(
          TAG,
          "Authentication state that doesn't require any UI change $authenticationState"
        )
      }
    })
  }

  private val signInLauncher = registerForActivityResult(
    FirebaseAuthUIActivityResultContract()
  ) { res ->
    this.onSignInResult(res)
  }

  private fun onSignInResult(result: FirebaseAuthUIAuthenticationResult) {
    val response = result.idpResponse
    if (result.resultCode == RESULT_OK) {
      // Successfully signed in
      val user = FirebaseAuth.getInstance().currentUser
      Log.i(TAG, "Signed in ${user?.displayName}")
    } else {
      // Sign in failed. If response is null the user canceled the
      // sign-in flow using the back button. Otherwise check
      // response.getError().getErrorCode() and handle the error.
      Log.i(TAG, "Sign in unsuccessful ${response?.error?.errorCode}")
    }
  }

  private fun launchSignInFlow() {
    val providers = arrayListOf(
      AuthUI.IdpConfig.GoogleBuilder().build(),
      AuthUI.IdpConfig.GitHubBuilder().build()
    )

    val intent =
      AuthUI.getInstance().createSignInIntentBuilder().setLogo(R.drawable.ic_launcher_foreground)
        .setAvailableProviders(providers).build()
    signInLauncher.launch(intent)
  }


}