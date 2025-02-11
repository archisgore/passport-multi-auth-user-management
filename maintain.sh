echo "Maintain the repo..."


function removeUnusedPackages() {
    echo "Removing unused packages by running 'npx depcheck'..."
    unusedpackages=$(npx depcheck --oneline --skip-missing --quiet --ignores ejs)
    echo "Found the following unused packages:"
    echo "$unusedpackages"
    for package in $unusedpackages; do
        echo "Uninstalling package $package..."
        npm uninstall --save $package
    done
}

function upgradeAllPackages() {
    echo "Upgrading all packages by running 'npm update --save'..."
    npm update --save
    echo "Upgrading all packages by running 'npx update'..."
    npx update
}

removeUnusedPackages
upgradeAllPackages

