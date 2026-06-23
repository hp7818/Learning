VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Form_frm_Category Update"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'**************************************************************************
'* $Date: 2020/01/22$
'* $Author: Min Ko Ko$
'* $Rev:  1.0$
'* Copyright (C) 2019 DIR-ACE Technology Ltd. All right reserved.
'*************************************************************************
Option Compare Database
Private Function checkForLogout()
    If Not checkUserStatus Then
        DoCmd.Close acForm, Me.Name
        DoCmd.openForm "frm_Login"
    End If
End Function

Private Sub btnCancel_Click()
    checkForLogout
 'DoCmd.Close
 'DoCmd.openForm "frm_CategorySearch"
    Dim SelectedCategoryID As Integer
    
    RefreshForms "frm_CategorySearch"
    If Not IsNull(Me.txtSelectedCategoryID) Then
        SelectedCategoryID = Me.txtSelectedCategoryID
        [Form_frm_CategorySearch].cboCategoryName = SelectedCategoryID
        Me.txtSelectedCategoryID = ""
    End If
    [Form_frm_CategorySearch].searchCriteria
End Sub

Private Sub btnCategoryUpdate_Click() '*** Modified 9/4/2024 THA (Bug-33) ***
    checkForLogout
    If UserHasPermission("MNU_032") Then
    
       
        Dim latestUpdateDate As Variant
        Dim strCriteria As String
        Dim sql As String
        Dim rs As DAO.Recordset
        
        ' Retrieve the latest UpdateDate from the table by CategoryID
        sql = "SELECT * FROM tbl_Category WHERE CategoryID = " & Me.txtCategoryID
        Set rs = CurrentDb.OpenRecordset(sql)
        
        If Not rs.EOF Then
            latestUpdateDate = rs!UpdateDate
        Else
            latestUpdateDate = Null
        End If
                
        If Not IsNull(latestUpdateDate) And Nz(Me.txtUpdateDate, "") <> latestUpdateDate Then
            MsgBox "The record has been updated by another user. The form will be refreshed.", vbExclamation, "Data Out-of-Sync"
            Me.txtCategoryName.Value = rs!Category
            Me.txtCategoryShortName.Value = rs!CategoryShortName
            Me.txtDescription.Value = rs!Description
            Me.txtUpdateDate.Value = latestUpdateDate
            Exit Sub
        End If
        
        rs.Close
        Set rs = Nothing
        If Me.txtCategoryName.Value = "" Or IsNull(Me.txtCategoryName.Value) Then
            MsgBox "Category Name  require.", vbInformation, ""
            Me.txtCategoryName.SetFocus
            Exit Sub
        ElseIf Me.txtCategoryShortName.Value = "" Or IsNull(Me.txtCategoryShortName.Value) Then
            MsgBox "Category require.", vbInformation, ""
            Me.txtCategoryShortName.SetFocus
            Exit Sub
        ElseIf Not IsNull(DLookup("Category", "tbl_Category", _
                "Category = '" & Me.txtCategoryName & "' And  DeleteFlag = 0 And Not CategoryID = " & Me.txtCategoryID & "")) Then
                MsgBox "CategoryName already exists.", vbInformation, ""
                Me.txtCategoryName.SetFocus
                Exit Sub
        ElseIf Not IsNull(DLookup("CategoryShortName", "tbl_Category", _
                "CategoryShortName = '" & Me.txtCategoryShortName & "' And  DeleteFlag = 0 And Not CategoryID = " & Me.txtCategoryID & "")) Then
                MsgBox "Category already exists.", vbInformation, ""
                Me.txtCategoryShortName.SetFocus
                Exit Sub
        Else
            If (MsgBox("Are you sure to update?If you want,click 'Yes'.", vbYesNo, "Confirmation Dialog") = vbYes) Then
                Call CategoryUpdateFunction
            End If
        End If
    Else
        GoToHome
    End If
    
    
End Sub

Function CategoryUpdateFunction()
    Dim updatedDate As Date
    updatedDate = Now

    CurrentDb.Execute "UPDATE tbl_Category SET Category ='" & Me.txtCategoryName & _
    "',CategoryShortName='" & Me.txtCategoryShortName & _
    "',Description='" & Me.txtDescription & _
    "',UpdateDate='" & updatedDate & _
    "',UpdateUser ='" & LoginUserId & _
    "' WHERE CategoryID = " & txtCategoryID
    
    MsgBox "Category updated successfully.", vbInformation, ""
    Call ClearFields
    btnCancel_Click
    
End Function

Function ClearFields()
 Me.txtCategoryID = Null
 Me.txtCategoryName = Null
 Me.txtCategoryShortName = Null
 Me.txtDescription = Null
End Function

