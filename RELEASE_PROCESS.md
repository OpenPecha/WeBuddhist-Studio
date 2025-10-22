# WeBuddhist-Studio Release Process - Timestamp Versioning

This document outlines the release process using timestamp-based versioning for WeBuddhist-Studio sprint releases.

## Versioning Strategy

We use timestamp-based versioning with the format: `YYYY.MM.DD.HHMM`

### Examples:

- `2024.10.22.1730` - Released on Oct 22, 2024 at 17:30
- `2024.11.05.0945` - Released on Nov 5, 2024 at 09:45

### Tag Formats:

- **Sprint releases**: `sprint-2024.10.22.1730`
- **Hotfixes**: `hotfix-2024.10.22.1730`
- **Major releases**: `release-2024.10.22.1730`

## Quick Release Commands

### Sprint Release (End of Sprint)

```bash
# Using npm scripts (recommended)
npm run release:sprint

# Using shell script
./scripts/sprint-release.sh

# Using Node.js directly
node scripts/release-sprint.js --type sprint
```

### Hotfix Release (Emergency fixes)

```bash
# Using npm scripts (recommended)
npm run release:hotfix

# Using shell script
./scripts/hotfix-release.sh

# Using Node.js directly
node scripts/release-sprint.js --type hotfix
```

### Major Release

```bash
# Using npm scripts
npm run release:major

# Using Node.js directly
node scripts/release-sprint.js --type release
```

## Advanced Usage

### Dry Run (See what would happen)

```bash
# Using npm script
npm run release:dry-run

# Using Node.js directly
node scripts/release-sprint.js --dry-run --type sprint
```

### Local Only (Don't push to remote)

```bash
node scripts/release-sprint.js --type sprint --no-push
```

## What the Release Script Does

1. **Checks Git Status**: Ensures working directory is clean (currently disabled)
2. **Generates Timestamp Version**: Creates version like `2024.10.22.1730`
3. **Updates package.json**: Updates the version field
4. **Commits Changes**: Commits the version update
5. **Creates Git Tag**: Creates annotated tag with release info
6. **Pushes Everything**: Pushes commits and tags to remote

## Sprint Workflow

### At the End of Each Sprint:

1. **Ensure all work is committed and merged**
2. **Switch to main/develop branch**
3. **Run sprint release**:
   ```bash
   git checkout main
   git pull origin main
   npm run release:sprint
   ```

### For Emergency Hotfixes:

1. **Create hotfix branch** (optional)
2. **Make the fix and commit**
3. **Run hotfix release**:
   ```bash
   npm run release:hotfix
   ```

## Available npm Scripts

```json
{
  "scripts": {
    "release:sprint": "node scripts/release-sprint.js --type sprint",
    "release:hotfix": "node scripts/release-sprint.js --type hotfix",
    "release:major": "node scripts/release-sprint.js --type release",
    "release:dry-run": "node scripts/release-sprint.js --dry-run --type sprint"
  }
}
```

## Viewing Releases

### List All Tags

```bash
git tag -l
```

### List Recent Tags (Sorted)

```bash
git tag -l --sort=-version:refname | head -10
```

### View Tag Details

```bash
git show sprint-2024.10.22.1730
```

### List Tags by Pattern

```bash
# Sprint releases only
git tag -l "sprint-*"

# Hotfixes only
git tag -l "hotfix-*"

# This month's releases
git tag -l "*2024.10.*"
```

## WeBuddhist-Studio Specific Considerations

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: Tolgee

### Before Release

- **Type Check**: `npm run build` (includes TypeScript compilation)
- **Run tests**: `npm test`
- **Run linting**: `npm run lint`
- **Format code**: `npm run format`
- **Check bundle size**: Ensure no unexpected size increases
- **Test components**: Verify shadcn/ui components work correctly

### After Release

- **Deploy to staging**: Test the tagged version
- **Update environment variables**: If needed for new features
- **Test internationalization**: Verify Tolgee translations work
- **Notify backend team**: If API changes are involved
- **Update component documentation**: If UI components changed

## Release Notes

After each sprint release, consider:

1. **Update CHANGELOG.md** with new features and fixes
2. **Create GitHub Release** with release notes
3. **Update component library documentation** if UI components changed
4. **Update Tolgee translations** if new text was added
5. **Notify QA team** for testing
6. **Deploy to production** if applicable

## Troubleshooting

### TypeScript Compilation Errors

```bash
# Check TypeScript errors
npm run build

# Fix type issues before release
npx tsc --noEmit
```

### Working Directory Not Clean

```bash
# Check what's uncommitted
git status

# Commit or stash changes
git add .
git commit -m "Pre-release cleanup"
```

### Node.js Not Found

```bash
# Check Node.js installation
node --version
npm --version

# Install Node.js if needed
# Visit: https://nodejs.org/
```

### Tag Already Exists

```bash
# Delete local tag
git tag -d sprint-2024.10.22.1730

# Delete remote tag
git push origin --delete sprint-2024.10.22.1730
```

### Failed Push

```bash
# Check remote connection
git remote -v

# Force push if needed (be careful!)
git push origin main --force-with-lease
```

## Integration with CI/CD

Consider adding these steps to your GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm ci

- name: Type check
  run: npm run build

- name: Run tests
  run: npm test

- name: Create Release Tag
  if: github.ref == 'refs/heads/main'
  run: |
    npm run release:sprint

- name: Deploy to Production
  if: startsWith(github.ref, 'refs/tags/sprint-')
  run: |
    npm run build
    # Add your deployment commands here
```

## Development Workflow Integration

### Pre-commit Hooks (Recommended)

```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run format && npm run lint"
```

### Component Development

- Use `npm run shad` to add new shadcn/ui components
- Follow TypeScript best practices
- Update Tolgee keys for internationalization
- Test components with React Testing Library

## Benefits of Timestamp Versioning

- **Chronological**: Easy to see when releases were made
- **Unique**: No conflicts or confusion about versions
- **Sortable**: Natural sorting works correctly
- **Meaningful**: Version tells you exactly when it was released
- **Sprint-Friendly**: Perfect for regular sprint releases
- **Cross-Platform**: Works consistently across different environments
- **TypeScript Compatible**: Works seamlessly with TypeScript projects
