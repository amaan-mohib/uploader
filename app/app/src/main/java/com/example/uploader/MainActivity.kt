package com.example.uploader

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.activity.viewModels
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.example.uploader.utils.SocketHandler
import com.example.uploader.viewmodels.LoginViewModel
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {

  private lateinit var navController: NavController
  private val viewModel by viewModels<LoginViewModel>()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    connectSocket()

    val navHostFragment=supportFragmentManager.findFragmentById(R.id.fragmentContainerView) as NavHostFragment
    navController=navHostFragment.navController

    val bottomNavView=findViewById<BottomNavigationView>(R.id.bottom_nav)
    bottomNavView.setupWithNavController(navController)

    navController.addOnDestinationChangedListener{_,destination,_ ->
      if(destination.id==R.id.loginFragment){
        bottomNavView.visibility=View.GONE
      }else{
        bottomNavView.visibility=View.VISIBLE
      }
    }

    observeAuthState()
  }

  private fun connectSocket() {
    SocketHandler.setSocket()
    SocketHandler.connect()
  }

  private fun observeAuthState() {
    viewModel.authenticationState.observe(this) { authenticationState ->
      when (authenticationState) {
        LoginViewModel.AuthenticationState.UNAUTHENTICATED -> {
          navController.navigate(R.id.loginFragment)
        }
        else -> Log.e(
          "MainFragment",
          "Authentication state that doesn't require any UI change $authenticationState"
        )
      }
    }
  }
//  override fun onSupportNavigateUp(): Boolean {
//    return navController.navigateUp()
//  }
}