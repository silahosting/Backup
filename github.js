// github.js - File untuk upload ke GitHub
const fs = require('fs');
const config = require('../settings');

// Fungsi backup ke GitHub
async function backupToGithub() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const zipFile = 'backup.zip';
    
    if (!fs.existsSync(zipFile)) {
      throw new Error('File backup.zip tidak ditemukan');
    }
    
    // Baca file zip sebagai base64
    const fileContent = fs.readFileSync(zipFile).toString('base64');
    const fileSize = (fs.statSync(zipFile).size / 1024 / 1024).toFixed(2);
    
    console.log(`   📦 Ukuran file: ${fileSize} MB`);
    console.log(`   📂 Target: ${config.githubRepo}/backups/backup-${timestamp}.zip`);
    
    // API GitHub untuk membuat/update file
    const url = `https://api.github.com/repos/${config.githubRepo}/contents/backups/backup-${timestamp}.zip`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `Auto backup ${timestamp}`,
        content: fileContent,
        branch: 'main' // atau 'master' sesuai repo Anda
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `GitHub API error: ${response.statusText}`);
    }
    
    console.log(`   ✅ Upload ke GitHub berhasil`);
    return { 
      success: true, 
      timestamp,
      url: data.content?.html_url || 'URL not available',
      size: fileSize + ' MB'
    };
  } catch (error) {
    console.error(`   ❌ GitHub backup error: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

module.exports = {
  backupToGithub
};