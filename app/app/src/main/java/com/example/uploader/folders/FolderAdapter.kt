package com.example.uploader.folders

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.RecyclerView
import com.example.uploader.viewmodels.FolderIdViewModel
import com.example.uploader.R

class FolderAdapter(private val folderList: List<Folder>,private val folderIdViewModel: FolderIdViewModel) :
  RecyclerView.Adapter<FolderAdapter.FolderViewHolder>() {


  class FolderViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
    val name: TextView = itemView.findViewById(R.id.folder_name)
    val card:CardView=itemView.findViewById(R.id.folder_card)
  }

  override fun onCreateViewHolder(
    parent: ViewGroup,
    viewType: Int
  ): FolderViewHolder {
    val itemView = LayoutInflater.from(parent.context).inflate(R.layout.folder_item, parent, false)
    return FolderViewHolder(itemView)
  }

  override fun onBindViewHolder(holder: FolderViewHolder, position: Int) {
    val folder: Folder = folderList[position]

    holder.name.text = folder.name
    holder.card.setOnClickListener { cardOnClick(folderIdViewModel,folder) }
  }

  private fun cardOnClick(folderIdViewModel: FolderIdViewModel, folder: Folder) {
    folderIdViewModel.parentId.value=folder.id
  }

  override fun getItemCount(): Int {
    return folderList.size
  }
}