import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import vue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vue.parserServices.defineTemplateBodyVisitor
    },
    plugins: {
      vue,
      prettier: eslintPluginPrettier
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          arrowParens: 'avoid',
          jsxSingleQuote: true,
          printWidth: 120,
          trailingComma: 'none',
          bracketSameLine: false
        }
      ],
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'arrow-parens': ['error', 'as-needed'],
      'vue/html-quotes': ['error', 'single', { avoidEscape: true }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/script-indent': [
        'error',
        0,
        {
          baseIndent: 0,
          switchCase: 0,
          ignores: []
        }
      ],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always'
        }
      ],
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1
        }
      ]
    }
  },
  prettierConfig
]
