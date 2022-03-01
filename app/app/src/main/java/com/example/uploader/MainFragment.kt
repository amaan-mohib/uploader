package com.example.uploader

import android.content.Context
import android.content.DialogInterface
import android.os.Bundle
import android.util.Log
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.addCallback
import androidx.core.os.bundleOf
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.databinding.FragmentMainBinding
import com.example.uploader.files.File
import com.example.uploader.files.FileAdapter
import com.example.uploader.folders.Folder
import com.example.uploader.folders.FolderAdapter
import com.example.uploader.folders.Owner
import com.example.uploader.folders.Path
import com.example.uploader.utils.autoFitColumns
import com.example.uploader.viewmodels.FolderIdViewModel
import com.example.uploader.viewmodels.FolderIdViewModelFactory
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputLayout
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration


class MainFragment : Fragment() {

  private lateinit var binding: FragmentMainBinding
  private lateinit var fileRecyclerView: RecyclerView
  private lateinit var folderRecyclerView: RecyclerView
  private lateinit var toolbar: MaterialToolbar

  private var currentFolder: Folder = Folder()

  private lateinit var fileArrayList: ArrayList<File>
  private lateinit var fileAdapter: FileAdapter
  private lateinit var filesListener: ListenerRegistration

  private lateinit var folderArrayList: ArrayList<Folder>
  private lateinit var folderAdapter: FolderAdapter
  private lateinit var folderListener: ListenerRegistration

  private lateinit var db: FirebaseFirestore
  private val currentUser: FirebaseUser? = FirebaseAuth.getInstance().currentUser

  private lateinit var folderModel: FolderIdViewModel
  private lateinit var folderIdViewModelFactory: FolderIdViewModelFactory

//  override fun onCreate(savedInstanceState: Bundle?) {
//    super.onCreate(savedInstanceState)
//
//  }

  override fun onCreateView(
    inflater: LayoutInflater, container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    // Inflate the layout for this fragment
    binding = FragmentMainBinding.inflate(inflater)

    folderIdViewModelFactory = FolderIdViewModelFactory(currentUser?.uid)
    folderModel = ViewModelProvider(this, folderIdViewModelFactory)[FolderIdViewModel::class.java]
    return binding.root
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    binding.newBtn.setOnClickListener { showNewBottomSheet(requireContext()) }
    toolbar = binding.toolbar

    fileRecyclerView = binding.fileList
    fileRecyclerView.autoFitColumns()
    fileArrayList = arrayListOf()
    fileAdapter = FileAdapter(fileArrayList)
    fileRecyclerView.adapter = fileAdapter

    folderRecyclerView = binding.folderList
    folderRecyclerView.autoFitColumns()
    folderArrayList = arrayListOf()
    folderAdapter = FolderAdapter(folderArrayList, folderModel)
    folderRecyclerView.adapter = folderAdapter

    db = FirebaseFirestore.getInstance()

    requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
//      Log.i(
//        "MainFragment",
//        "currentId: ${folderModel.parentId.value} currentPId: ${currentFolder.parentId}"
//      )
      if (folderModel.parentId.value == currentUser?.uid) {
        if (isEnabled) {
          isEnabled = false
          requireActivity().onBackPressed()
        }
      } else {
        folderModel.parentId.value = currentFolder.parentId
      }
    }

    toolbar.setOnMenuItemClickListener {
      when (it.itemId) {
        R.id.new_folder_menu -> {
          showNewFolderDialog(requireContext())
          true
        }
        else -> false
      }
    }

    folderModel.parentId.observe(viewLifecycleOwner, { parentId ->

      eventChangeListener(parentId)

      if (parentId == currentUser?.uid) {
        toolbar.title = "Uploader"
        toolbar.navigationIcon = null
        toolbar.menu.findItem(R.id.share_menu).isVisible = false
      } else {
        toolbar.menu.findItem(R.id.share_menu).isVisible = true
      }

    })

  }

  private fun eventChangeListener(parentId: String) {
    val uid = currentUser?.uid

    val docRef = db.collection("users/${uid}/folders").document(parentId)
    docRef.get().addOnSuccessListener { doc ->
      try {
        if (doc != null) {
          currentFolder = doc.toObject(Folder::class.java)!!
          toolbar.title = currentFolder.name
          toolbar.setNavigationIcon(R.drawable.ic_baseline_arrow_back_24)
          toolbar.setNavigationOnClickListener {
            folderModel.parentId.value = currentFolder.parentId
          }
        } else {
          currentFolder = Folder()
          Log.i(TAG, "No such document")
        }
      } catch (ex: Exception) {
        ex.message?.let { Log.e("MainFragment", it) }
      }
    }.addOnFailureListener { exception ->
      Log.w(TAG, "Error getting docs: ", exception)
    }

    filesListener = db.collection("users/${uid}/files").whereEqualTo("parentId", parentId)
      .addSnapshotListener { docs, e ->
        if (e != null) {
          Log.w(TAG, "Listen failed.", e)
          return@addSnapshotListener
        }

        if (docs != null) {
          fileArrayList.clear()
          for (doc in docs) {
            fileArrayList.add(doc.toObject(File::class.java))
          }
        }

        fileAdapter.notifyDataSetChanged()
      }

    folderListener = db.collection("users/${uid}/folders").whereEqualTo("parentId", parentId)
      .addSnapshotListener { docs, e ->
        if (e != null) {
          Log.w(TAG, "Listen failed.", e)
          return@addSnapshotListener
        }

        if (docs != null) {
          folderArrayList.clear()
          for (doc in docs) {
            folderArrayList.add(doc.toObject(Folder::class.java))
          }
        }

        folderAdapter.notifyDataSetChanged()
      }

  }

  private fun showNewFolderDialog(context: Context) {
    val dialog = MaterialAlertDialogBuilder(context)
    dialog.setTitle("New Folder")
    val view = layoutInflater.inflate(R.layout.new_folder_dialog, null)
    val textField: TextInputLayout = view.findViewById(R.id.newFolderText)
    dialog.setView(view).setPositiveButton("Create") { d, _ ->
      createFolder(textField.editText?.text.toString(), d)
    }.setNegativeButton("Cancel") { d, _ ->
      d.cancel()
    }.show()

    textField.editText?.requestFocus()
  }

  private fun createFolder(name: String, d: DialogInterface) {
    val uid = currentUser?.uid
    val docRef = db.collection("users/${uid}/folders").document()
    var prevPath = currentFolder.path
    if (folderModel.parentId.value == uid) {
      prevPath = arrayListOf(Path("/", "Home"), Path("//${docRef.id}", name))
    } else {
      if (prevPath == null) {
        prevPath = arrayListOf(Path("/", "Home"), Path("//${docRef.id}", name))
      } else {
        prevPath.add(Path("${prevPath.last().id}/${docRef.id}", name))
      }
    }
    val folder = Folder(
      id = docRef.id,
      name = name,
      parentId = folderModel.parentId.value,
      owner = Owner(currentUser?.displayName, currentUser?.photoUrl.toString()),
      path = prevPath
    )
    docRef.set(folder).addOnSuccessListener {
      Log.d(TAG, "DocumentSnapshot written with ID: ${docRef.id}")
    }.addOnFailureListener { e ->
      Log.w(TAG, "Error adding document", e)
    }.addOnCompleteListener {
      d.dismiss()
    }
  }

  private fun showNewBottomSheet(context: Context) {
    val dialog = BottomSheetDialog(context)
    val view = layoutInflater.inflate(R.layout.new_bottom_sheet, null)
    val newFolderButton: FloatingActionButton = view.findViewById(R.id.new_folder)
    val newFileButton: FloatingActionButton = view.findViewById(R.id.new_file)
    dialog.setContentView(view)
    dialog.show()
    newFolderButton.setOnClickListener {
      dialog.dismiss()
      showNewFolderDialog(context)
    }
    newFileButton.setOnClickListener {
      dialog.dismiss()
      val folder =
        bundleOf("currentFolderId" to currentFolder.id, "currentFolderPath" to currentFolder.path)
      findNavController().navigate(R.id.uploadFragment, folder)
    }
  }

  companion object {
    const val TAG = "MainFragment"
  }

  override fun onDestroyView() {
    super.onDestroyView()

    filesListener.remove()
    folderListener.remove()
  }
}