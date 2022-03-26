package com.example.uploader.viewmodels

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class UUIDViewModel:ViewModel() {
  val shortUUID: MutableLiveData<String> by lazy {
    MutableLiveData<String>("")
  }
  val uuid: MutableLiveData<String> by lazy {
    MutableLiveData<String>("")
  }
}