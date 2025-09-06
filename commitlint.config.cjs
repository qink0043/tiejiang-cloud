module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 校验规则
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',//新特性
        'fix',//修复
        'docs',//文档
        'style',//样式
        'refactor',//重构
        'perf',//性能
        'test',//测试
        'chore',// 其他修改
        'revert',//回滚
        'build',//编译相关修改，例如构建工具、依赖项等
      ],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
}