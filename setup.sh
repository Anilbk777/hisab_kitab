mkdir -p backend/{api/v1,services,repositories,models,schemas}

touch backend/api/v1/{auth.py,accounts.py,entries.py}

touch backend/services/{auth_service.py,account_service.py,entry_service.py}

touch backend/repositories/{user_repo.py,account_repo.py,entry_repo.py}

touch backend/models/{user.py,person_account.py,entry.py}

touch backend/schemas/{auth.py,account.py,entry.py}