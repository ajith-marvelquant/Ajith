# Ajith Repository

Welcome to the Ajith repository!

## About
This repository contains projects and code related to Ajith's work, including the Tad application with parquet download functionality.

## Getting Started

### Prerequisites
- Git LFS (Large File Storage) must be installed to properly download executable files

### Installation Steps

1. **Install Git LFS** (if not already installed):
   ```bash
   git lfs install
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/ajith-marvelquant/Ajith.git
   cd Ajith
   ```

3. **Pull LFS files**:
   ```bash
   git lfs pull
   ```

4. **Verify Tad.exe is available**:
   ```bash
   ls -la Tad.exe
   ```

5. **Run Tad application**:
   ```bash
   ./Tad.exe
   ```

### Important Notes
- The repository uses Git LFS for large files (>100MB)
- Without running `git lfs pull`, the executable files will appear as pointer files and won't work
- Make sure you have internet connectivity when running `git lfs pull` the first time

### Troubleshooting
- If `tad.exe` doesn't run, verify that Git LFS is installed and run `git lfs pull`
- If files appear corrupted or very small, they are likely LFS pointer files that need to be pulled
