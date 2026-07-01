import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
      'check-file': checkFile,
    },
    rules: {
      // 1. Khắt khe nghiêm cấm lạm dụng kiểu 'any'
      '@typescript-eslint/no-explicit-any': 'error',

      // 2. Cấm biến thừa, import thừa không sử dụng
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
      ],

      // 3. Cảnh báo quy tắc đặt tên file/folder theo kiểu kebab-case.
      // Hạ từ "error" xuống "warn" để không block build/dev nhanh,
      // nhưng team vẫn nhìn thấy cảnh báo và có thể chuẩn hóa dần.
      'check-file/filename-naming-convention': [
        'warn',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { 'ignoreMiddleExtensions': true }
      ],
      'check-file/folder-naming-convention': [
        'warn',
        { 'src/**/': 'KEBAB_CASE' }
      ],

      // 4. Chống sử dụng Magic Number (Các số không rõ nguồn gốc)
      '@typescript-eslint/no-magic-numbers': ['warn', { 'ignore': [0, 1, -1], 'ignoreArrayIndexes': true }]
    },
  }
);
