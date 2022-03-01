package com.example.uploader

import android.graphics.BitmapFactory
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.navigation.fragment.findNavController
import com.example.uploader.databinding.FragmentProfileBinding
import com.firebase.ui.auth.AuthUI
import com.google.firebase.auth.FirebaseAuth
import com.squareup.picasso.Picasso
import java.lang.Exception
import java.util.concurrent.Executors

class ProfileFragment : Fragment() {

  private lateinit var binding: FragmentProfileBinding
  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    binding= FragmentProfileBinding.inflate(inflater)
    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    getPhotoURL()
    setInfo()

    binding.logoutBtn.setOnClickListener { logout() }
    binding.changeAct.setOnClickListener { changeAct() }
  }

  private fun changeAct() {
    val navController = findNavController()
    navController.navigate(R.id.loginFragment)
  }

  private fun logout() {
    AuthUI.getInstance().signOut(requireContext())
  }

  private fun setInfo() {
    val user=FirebaseAuth.getInstance().currentUser
    if(user!=null){
      binding.displayName.text=user.displayName
      binding.email.text=user.email
    }
  }

  private fun getPhotoURL() {
    val user=FirebaseAuth.getInstance().currentUser
    val url=user?.photoUrl.toString()

    Picasso.get()
      .load(url)
      .resize(100,100).centerCrop()
      .placeholder(R.drawable.ic_baseline_person_24)
      .into(binding.photoURL)

  }

}