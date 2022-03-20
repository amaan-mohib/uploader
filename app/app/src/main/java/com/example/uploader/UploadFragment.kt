package com.example.uploader

import android.app.Activity.RESULT_OK
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import com.example.uploader.databinding.FragmentUploadBinding
import android.provider.OpenableColumns
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.net.toUri
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.files.File
import com.example.uploader.files.FileUploadAdapter
import com.example.uploader.folders.Owner
import com.example.uploader.folders.Path
import com.google.android.material.button.MaterialButton
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.StorageReference
import com.google.firebase.storage.ktx.storage
import com.google.firebase.storage.ktx.component1
import com.google.firebase.storage.ktx.component2


class UploadFragment : Fragment() {

  private lateinit var binding: FragmentUploadBinding
  private lateinit var currentFolderId: String
  private lateinit var currentFolderPath: ArrayList<Path>
  private val currentUser: FirebaseUser? = FirebaseAuth.getInstance().currentUser
  private val storage = Firebase.storage
  private lateinit var storageReference: StorageReference
  private lateinit var db: FirebaseFirestore

  private lateinit var fileArrayList: ArrayList<File>
  private lateinit var fileAdapter: FileUploadAdapter
  private lateinit var fileRecyclerView: RecyclerView
  private lateinit var uploadButton: MaterialButton
  private lateinit var clearButton: MaterialButton
  private lateinit var filesText: TextView
  private lateinit var progressBar: ProgressBar

//  override fun onCreate(savedInstanceState: Bundle?) {
//    super.onCreate(savedInstanceState)
//
//  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    binding = FragmentUploadBinding.inflate(inflater)

    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)

    val id = arguments?.getString("currentFolderId")
    currentFolderId = (id ?: currentUser?.uid) as String
    currentFolderPath =
      arguments?.getParcelableArrayList<Path>("currentFolderPath") as ArrayList<Path>


    Log.i(TAG, "folder: $currentFolderId path: ${currentFolderPath[0].id}")

    uploadButton = binding.uploadBtn
    clearButton = binding.clearList

    binding.showQrBtn.setOnClickListener {
      findNavController().navigate(R.id.QRFragment)
    }

    clearButton.setOnClickListener {
      reset()
    }
    uploadButton.setOnClickListener {
      uploadFiles()
    }

    filesText = binding.filesText
    fileRecyclerView = binding.fileUploadList
    progressBar = binding.progressBar
    fileRecyclerView.layoutManager = LinearLayoutManager(requireContext())
    fileArrayList = arrayListOf()
    fileAdapter = FileUploadAdapter(fileArrayList)
    fileRecyclerView.adapter = fileAdapter

    db = FirebaseFirestore.getInstance()
    storageReference = storage.reference

    val uploadBtn = binding.addFilesBtn
    uploadBtn.setOnClickListener { selectFiles() }
  }

  private fun uploadFiles() {
    clearButton.visibility = View.GONE
    progressBar.visibility = View.VISIBLE
    for (file in fileArrayList) {
      uploadImage(file.name, file.type, file.size, file.url?.toUri(), fileArrayList.indexOf(file))
    }
  }

  private fun reset() {
    val items = fileArrayList.size
    fileArrayList.clear()
    progressBar.progress = 0
    fileRecyclerView.visibility = View.GONE
    uploadButton.visibility = View.GONE
    clearButton.visibility = View.GONE
    filesText.visibility = View.GONE
    progressBar.visibility = View.GONE
    fileAdapter.notifyItemRangeRemoved(0, items)
  }

  private val getContent = registerForActivityResult(
    ActivityResultContracts.StartActivityForResult()
  ) { res ->
    this.launcherResult(res)
  }

  private fun launcherResult(result: ActivityResult) {
    fileRecyclerView.visibility = View.VISIBLE
    uploadButton.visibility = View.VISIBLE
    clearButton.visibility = View.VISIBLE
    filesText.visibility = View.VISIBLE

    Log.i(TAG, "result: ${result.data} code: ${result.resultCode}")
    val data = result.data
    if (result.resultCode == RESULT_OK) {

      if (data?.clipData != null) {
        val total = data.clipData?.itemCount
        for (i in 0 until total!!) {

          val fileData = data.clipData!!.getItemAt(i).uri
          getFileInfo(fileData)

        }
      } else {
        //single file
        val fileData = data?.data
        if (fileData != null) {
          getFileInfo(fileData)
        }
      }
    }
  }

  private fun getFileInfo(fileData: Uri) {
    var name: String
    var size: Long
    var uriFinal: Uri

    val type: String? = context?.contentResolver?.getType(fileData)
    fileData.let { uri ->
      uriFinal = uri
      context?.contentResolver?.query(uri, null, null, null, null)
    }?.use { cursor ->
      val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
      cursor.moveToFirst()
      name = cursor.getString(nameIndex)
      size = cursor.getLong(sizeIndex)

      fileArrayList.add(File(name = name, type = type, size = size, url = uriFinal.toString()))
      uploadButton.text = getString(R.string.upload, fileArrayList.size)
      fileAdapter.notifyItemInserted(fileArrayList.size)

      Log.i(TAG, "result: $name $size $type $nameIndex $sizeIndex")
    }
  }

  private fun uploadImage(name: String?, type: String?, size: Long?, uri: Uri?, index: Int) {
    val id = currentFolderPath.last().id
    val newPath = "${currentUser?.uid}/${id?.substring(1)}/$name"
    val ref = storageReference.child(newPath)
    val uploadTask = ref.putFile(uri!!)
    uploadTask.addOnProgressListener { (bytesTransferred, totalByteCount) ->
      val progress = (100.0 * bytesTransferred) / totalByteCount
      Log.d(TAG, "Upload is $progress% done")
      progressBar.progress += progress.toInt() / fileArrayList.size
    }.addOnPausedListener {
      Log.d(TAG, "Upload is paused")
    }.addOnFailureListener { e ->
      // Handle unsuccessful uploads
      Log.e(TAG, "error occurred: $e")
    }.addOnSuccessListener {
      // Handle successful uploads on complete
      Log.i(TAG, "upload complete")
    }.continueWithTask { task ->
      if (!task.isSuccessful) {
        task.exception?.let {
          throw it
        }
      }
      ref.downloadUrl
    }.addOnCompleteListener { task ->
      if (task.isSuccessful) {
        val downloadUri = task.result
        saveFile(name, type, size, downloadUri.toString(), index)
      } else {
        Log.e(TAG, "failed: ${task.result}")
      }
    }
  }

  private fun saveFile(name: String?, type: String?, size: Long?, url: String, index: Int) {
    val uid = currentUser?.uid
    val docRef = db.collection("users/$uid/files").document()
    val file = File(
      id = docRef.id,
      name = name,
      type = type,
      size = size,
      url = url,
      parentId = currentFolderId,
      path = currentFolderPath,
      owner = Owner(currentUser?.displayName, currentUser?.photoUrl.toString())
    )
    docRef.set(file).addOnCompleteListener {
      if (index == fileArrayList.size - 1) reset()
    }
  }

  private fun selectFiles() {
    val intent = Intent()
    intent.addCategory(Intent.CATEGORY_OPENABLE)
    intent.type = "*/*"
    intent.action = Intent.ACTION_OPEN_DOCUMENT
    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
    getContent.launch(intent)
  }

  companion object {
    const val TAG = "UploadFragment"
  }
}