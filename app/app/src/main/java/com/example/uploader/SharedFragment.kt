package com.example.uploader

import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.databinding.FragmentSharedBinding
import com.example.uploader.files.File
import com.example.uploader.files.FileAdapter
import com.example.uploader.utils.autoFitColumns
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore

class SharedFragment : Fragment() {

  private lateinit var binding: FragmentSharedBinding
  private lateinit var fileRecyclerView: RecyclerView

  private lateinit var fileArrayList: ArrayList<File>
  private lateinit var fileAdapter: FileAdapter

  private lateinit var db: FirebaseFirestore
  private val currentUser: FirebaseUser? = FirebaseAuth.getInstance().currentUser

//  override fun onCreate(savedInstanceState: Bundle?) {
//    super.onCreate(savedInstanceState)
//
//  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // Inflate the layout for this fragment
   binding= FragmentSharedBinding.inflate(inflater)
    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    fileRecyclerView = binding.sharedList
    fileRecyclerView.autoFitColumns()
    fileArrayList = arrayListOf()
    fileAdapter = FileAdapter(fileArrayList)
    fileRecyclerView.adapter = fileAdapter

    db = FirebaseFirestore.getInstance()

    loadFiles()
  }

  private fun loadFiles() {
    val uid=currentUser?.uid

    db.collection("users/${uid}/files").whereEqualTo("parentId", "shared")
      .get().addOnSuccessListener { docs ->
        fileArrayList.clear()
        for (doc in docs) {
          fileArrayList.add(doc.toObject(File::class.java))
        }

        fileAdapter.notifyDataSetChanged()
      }
      .addOnFailureListener { exception ->
        Log.w(TAG, "Error getting docs: ", exception)
      }
  }

  companion object {
    const val TAG = "SharedFragment"
  }
}