// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Custom resolver for path aliases
const customResolver = (context, moduleName, platform) => {
  // Define path aliases
  const aliases = {
    '@': path.resolve(__dirname, '.'),
    '@shared': path.resolve(__dirname, 'shared'),
    '@entities': path.resolve(__dirname, 'entities'),
    '@features': path.resolve(__dirname, 'features'),
    '@app': path.resolve(__dirname, 'app'),
  };

  // Check if the module name matches an alias
  for (const [alias, aliasPath] of Object.entries(aliases)) {
    if (moduleName.startsWith(alias + '/')) {
      // Replace alias with actual path
      const subPath = moduleName.slice(alias.length + 1);
      const fullPath = path.join(aliasPath, subPath);

      // Return the resolved path
      return context.resolveRequest(context, fullPath, platform);
    }
  }

  // Fall back to default resolution for non-aliased modules
  return context.resolveRequest(context, moduleName, platform);
};

// Create new config object to avoid read-only property issues
const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    resolveRequest: customResolver,
  },
};

module.exports = config;
