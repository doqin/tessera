# tests/

Integration test kiểm tra luồng ghép nối giữa Shell app và các Micro Frontend module (load
module, truyền state qua Zustand store dùng chung, điều hướng) — theo Control Procedures của
Project Charter và Testing requirements ở `.specify/constitution.md` §3.

Unit test của từng module/package nằm cạnh source code tương ứng (VD:
`packages/shared-ui/src/Button.test.tsx`), không đặt ở đây.
