-- Initialize default users
-- Password for both users: password123
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$nXRdETQFW/0qMp8YZ1fecO6VM/mf54WDAkvWb.NZIC0J77qaw3GCG', 'ADMIN'),
('user', '$2a$10$nXRdETQFW/0qMp8YZ1fecO6VM/mf54WDAkvWb.NZIC0J77qaw3GCG', 'USER');

