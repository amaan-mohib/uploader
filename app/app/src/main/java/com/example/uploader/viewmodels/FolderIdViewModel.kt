package com.example.uploader.viewmodels

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import java.lang.IllegalArgumentException

class FolderIdViewModel(initId: String?) : ViewModel() {
  val parentId: MutableLiveData<String> by lazy {
    MutableLiveData<String>(initId)
  }
}

class FolderIdViewModelFactory(private val initId: String?):ViewModelProvider.Factory{
  override fun <T : ViewModel> create(modelClass: Class<T>): T {
    if(modelClass.isAssignableFrom(FolderIdViewModel::class.java)){
      return FolderIdViewModel(initId) as T
    }
    throw IllegalArgumentException("Unknown viewModel class")
  }

}