# Parquet to CSV Download Feature

This document describes the implementation of the Parquet-to-CSV download feature for Tad.

## Overview

The feature allows users to:
1. Download a single Parquet file as CSV
2. Download a directory containing Parquet files as a ZIP file with all Parquet files converted to CSV

## Implementation

### Backend (main.bundle.js)

The patch script (`patch-parquet-download.js`) adds:

1. **IPC Handler**: `download-parquet-as-csv` - Handles the conversion request
2. **Helper Functions**:
   - `convertSingleParquet(parquetPath, csvPath)` - Converts a single Parquet file to CSV
   - `convertParquetDir(dirPath, zipPath)` - Converts all Parquet files in a directory to CSV and creates a ZIP file

### How It Works

1. **Single File**: 
   - User selects a Parquet file
   - Clicks "Download Parquet as CSV" from File menu
   - System prompts for save location
   - Converts Parquet to CSV using DuckDB's `read_parquet()` function
   - Saves as CSV file

2. **Directory**:
   - User selects a directory containing Parquet files
   - Clicks "Download Parquet as CSV" from File menu
   - System prompts for ZIP save location
   - Finds all `.parquet` files in directory
   - Converts each to CSV
   - Creates a ZIP file containing all CSV files

### Dependencies

- `archiver` - For creating ZIP files (needs to be installed if not present)
- `fast-csv` - Already available in Tad
- `reltab-duckdb` - Already available in Tad (for reading Parquet files)

### Usage

1. Open a Parquet file or directory in Tad
2. Go to File menu
3. Select "Download Parquet as CSV..."
4. Choose save location
5. Wait for conversion to complete

## Notes

- The conversion uses DuckDB's native Parquet reading capabilities
- Large files are processed in chunks (1M rows at a time)
- The feature automatically detects if the source is a file or directory

