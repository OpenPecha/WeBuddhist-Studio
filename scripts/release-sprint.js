#!/usr/bin/env node
/**
 * Sprint Release Script with Timestamp Versioning for WeBuddhist-Studio
 * Automatically creates version tags and updates package.json version
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SprintReleaser {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.packageJsonPath = path.join(projectRoot, 'package.json');
    }

    generateTimestampVersion() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}.${month}.${day}.${hour}${minute}`;
    }

    updatePackageJsonVersion(version) {
        if (!fs.existsSync(this.packageJsonPath)) {
            throw new Error(`package.json not found at ${this.packageJsonPath}`);
        }

        // Read current package.json
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
        const oldVersion = packageJson.version;
        
        // Update version
        packageJson.version = version;
        
        // Write back with proper formatting
        fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        
        console.log(`✅ Updated package.json version: ${oldVersion} → ${version}`);
    }

    runGitCommand(command) {
        try {
            const result = execSync(command, { 
                cwd: this.projectRoot, 
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            return result.trim();
        } catch (error) {
            console.error(`❌ Git command failed: ${command}`);
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }

    checkGitStatus() {
        const status = this.runGitCommand('git status --porcelain');
        if (status) {
            console.log('❌ Working directory is not clean. Please commit or stash changes first.');
            console.log('Uncommitted changes:');
            console.log(status);
            process.exit(1);
        }
        console.log('✅ Working directory is clean');
    }

    createGitTag(version, tagType = 'sprint') {
        const tagName = `${tagType}-${version}`;
        
        // Create annotated tag
        const tagMessage = `${tagType.charAt(0).toUpperCase() + tagType.slice(1)} release ${version}`;
        this.runGitCommand(`git tag -a ${tagName} -m "${tagMessage}"`);
        console.log(`✅ Created tag: ${tagName}`);
        
        // Push tag to remote
        this.runGitCommand(`git push origin ${tagName}`);
        console.log(`✅ Pushed tag to remote: ${tagName}`);
    }

    commitVersionUpdate(version) {
        this.runGitCommand('git add package.json');
        const commitMessage = `chore: bump version to ${version}`;
        this.runGitCommand(`git commit -m "${commitMessage}"`);
        console.log(`✅ Committed version update: ${version}`);
    }

    getCurrentBranch() {
        return this.runGitCommand('git branch --show-current');
    }

    releaseSprint(tagType = 'sprint', pushChanges = true) {
        console.log(`🚀 Starting ${tagType} release process...`);
        
        // Check git status - DISABLED for consistency with other repos
        // this.checkGitStatus();
        
        // Get current branch
        const currentBranch = this.getCurrentBranch();
        console.log(`📋 Current branch: ${currentBranch}`);
        
        // Generate version
        const version = this.generateTimestampVersion();
        console.log(`📅 Generated version: ${version}`);
        
        // Update package.json
        this.updatePackageJsonVersion(version);
        
        // Commit version update
        this.commitVersionUpdate(version);
        
        // Create and push tag
        this.createGitTag(version, tagType);
        
        // Push commits to remote
        if (pushChanges) {
            try {
                this.runGitCommand(`git push origin ${currentBranch}`);
                console.log(`✅ Pushed changes to ${currentBranch}`);
            } catch (error) {
                console.log(`⚠️  Failed to push to ${currentBranch} (possibly protected branch)`);
                console.log('✅ Tag was still created and pushed successfully');
            }
        }
        
        console.log(`🎉 ${tagType.charAt(0).toUpperCase() + tagType.slice(1)} release ${version} completed successfully!`);
        return version;
    }
}

function main() {
    const args = process.argv.slice(2);
    const tagType = args.includes('--type') ? args[args.indexOf('--type') + 1] : 'sprint';
    const noPush = args.includes('--no-push');
    const dryRun = args.includes('--dry-run');
    
    // Validate tag type
    const validTypes = ['sprint', 'release', 'hotfix'];
    if (!validTypes.includes(tagType)) {
        console.error(`❌ Invalid tag type: ${tagType}. Must be one of: ${validTypes.join(', ')}`);
        process.exit(1);
    }
    
    // Find project root
    const projectRoot = path.dirname(__dirname);
    
    if (dryRun) {
        const version = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '.').replace('.', '.').slice(0, -3);
        console.log(`🔍 DRY RUN - Would create ${tagType} release:`);
        console.log(`   Version: ${version}`);
        console.log(`   Tag: ${tagType}-${version}`);
        console.log(`   Push changes: ${!noPush}`);
        return;
    }
    
    try {
        const releaser = new SprintReleaser(projectRoot);
        const version = releaser.releaseSprint(tagType, !noPush);
        
        console.log('\n📋 Release Summary:');
        console.log(`   Version: ${version}`);
        console.log(`   Tag: ${tagType}-${version}`);
        console.log('   Project: WeBuddhist-Studio (pechastudio)');
        
    } catch (error) {
        console.error(`❌ Release failed: ${error.message}`);
        process.exit(1);
    }
}

// Run main function - always execute when script is run directly
main();
