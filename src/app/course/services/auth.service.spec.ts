import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserCredentials } from './auth.service';
import { User } from '../models/user.interface';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'student',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should load user from localStorage on initialization', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      const newService = new AuthService(TestBed.inject(HttpClientTestingModule) as any);

      expect(newService.currentUserValue).toEqual(mockUser);
    });

    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('currentUserValue', () => {
    it('should return the current user value', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.currentUserValue).toEqual(mockUser);
    });

    it('should return null when no user is logged in', () => {
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('currentUserId', () => {
    it('should return the current user ID', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.currentUserId).toBe(1);
    });

    it('should return null when no user is logged in', () => {
      expect(service.currentUserId).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is logged in and token exists', () => {
      service['currentUserSubject'].next(mockUser);
      localStorage.setItem('token', mockToken);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when user is null', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token is missing', () => {
      service['currentUserSubject'].next(mockUser);

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Role Checks', () => {
    it('should correctly identify a student', () => {
      service['currentUserSubject'].next({ ...mockUser, role: 'student' });
      expect(service.isStudent()).toBe(true);
      expect(service.isInstructor()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should correctly identify an instructor', () => {
      service['currentUserSubject'].next({ ...mockUser, role: 'instructor' });
      expect(service.isInstructor()).toBe(true);
      expect(service.isStudent()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should correctly identify an admin', () => {
      service['currentUserSubject'].next({ ...mockUser, role: 'admin' });
      expect(service.isAdmin()).toBe(true);
      expect(service.isStudent()).toBe(false);
      expect(service.isInstructor()).toBe(false);
    });

    it('should return false for all roles when no user is logged in', () => {
      expect(service.isStudent()).toBe(false);
      expect(service.isInstructor()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      service['currentUserSubject'].next({ ...mockUser, role: 'admin' });
      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      service['currentUserSubject'].next({ ...mockUser, role: 'student' });
      expect(service.hasRole('admin')).toBe(false);
    });

    it('should return false when no user is logged in', () => {
      expect(service.hasRole('student')).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user and store token', (done) => {
      const name = 'New User';
      const email = 'new@example.com';
      const password = 'password123';
      const mockResponse = { user: mockUser, token: mockToken };

      service.register(name, email, password).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
        expect(service.currentUserValue).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name, email, password, role: 'student' });
      req.flush(mockResponse);
    });

    it('should register with custom role', (done) => {
      const name = 'Admin User';
      const email = 'admin@example.com';
      const password = 'password123';
      const role = 'admin';
      const mockResponse = { user: { ...mockUser, role: 'admin' }, token: mockToken };

      service.register(name, email, password, role).subscribe(user => {
        expect(user.role).toBe('admin');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.body).toEqual({ name, email, password, role });
      req.flush(mockResponse);
    });

    it('should handle registration error', (done) => {
      const name = 'New User';
      const email = 'new@example.com';
      const password = 'password123';

      service.register(name, email, password).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/register`);
      req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('login', () => {
    it('should login user and store token', (done) => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { user: mockUser, token: mockToken };

      service.login(email, password).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
        expect(service.currentUserValue).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      service.login(email, password).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset currentUser', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });

    it('should emit null to currentUser$ observable', (done) => {
      service['currentUserSubject'].next(mockUser);

      service.currentUser$.subscribe(user => {
        if (user === null) {
          done();
        }
      });

      service.logout();
    });
  });

  describe('getProfile', () => {
    it('should fetch and update user profile', (done) => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      service.getProfile().subscribe(user => {
        expect(user).toEqual(updatedUser);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedUser));
        expect(service.currentUserValue).toEqual(updatedUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(updatedUser);
    });

    it('should handle getProfile error', (done) => {
      service.getProfile().subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', (done) => {
      const updateData = { name: 'Updated Name', avatarUrl: 'https://example.com/new-avatar.jpg' };
      const updatedUser = { ...mockUser, ...updateData };

      service.updateProfile(updateData).subscribe(user => {
        expect(user).toEqual(updatedUser);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedUser));
        expect(service.currentUserValue).toEqual(updatedUser);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedUser);
    });

    it('should handle partial updates', (done) => {
      const updateData = { name: 'New Name Only' };
      const updatedUser = { ...mockUser, name: 'New Name Only' };

      service.updateProfile(updateData).subscribe(user => {
        expect(user.name).toBe('New Name Only');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/profile`);
      req.flush(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should change user password', (done) => {
      const currentPassword = 'oldpass123';
      const newPassword = 'newpass456';
      const mockResponse = { message: 'Password changed successfully' };

      service.changePassword(currentPassword, newPassword).subscribe(response => {
        expect(response.message).toBe('Password changed successfully');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword, newPassword });
      req.flush(mockResponse);
    });

    it('should handle incorrect current password', (done) => {
      const currentPassword = 'wrongpass';
      const newPassword = 'newpass456';

      service.changePassword(currentPassword, newPassword).subscribe(
        () => fail('should have failed'),
        error => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiUrl}/change-password`);
      req.flush({ message: 'Current password is incorrect' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Admin Operations', () => {
    describe('getAllUsers', () => {
      it('should fetch all users', (done) => {
        const mockUsers: User[] = [mockUser, { ...mockUser, id: 2, email: 'user2@example.com' }];

        service.getAllUsers().subscribe(users => {
          expect(users.length).toBe(2);
          expect(users).toEqual(mockUsers);
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUsers);
      });
    });

    describe('getUserById', () => {
      it('should fetch user by ID', (done) => {
        const userId = 5;

        service.getUserById(userId).subscribe(user => {
          expect(user).toEqual(mockUser);
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);
      });
    });

    describe('createUser', () => {
      it('should create a new user', (done) => {
        const userData = {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'student' as const,
          avatarUrl: 'https://example.com/avatar.jpg'
        };

        service.createUser(userData).subscribe(user => {
          expect(user).toEqual(mockUser);
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(userData);
        req.flush(mockUser);
      });
    });

    describe('updateUser', () => {
      it('should update an existing user', (done) => {
        const userId = 3;
        const updates = { name: 'Updated Name', role: 'instructor' as const };
        const updatedUser = { ...mockUser, ...updates };

        service.updateUser(userId, updates).subscribe(user => {
          expect(user).toEqual(updatedUser);
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updates);
        req.flush(updatedUser);
      });

      it('should update user password', (done) => {
        const userId = 3;
        const updates = { password: 'newpassword123' };

        service.updateUser(userId, updates).subscribe(user => {
          expect(user).toEqual(mockUser);
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
        expect(req.request.body).toEqual(updates);
        req.flush(mockUser);
      });
    });

    describe('deleteUser', () => {
      it('should delete a user', (done) => {
        const userId = 7;

        service.deleteUser(userId).subscribe(() => {
          done();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
      });
    });
  });

  describe('currentUser$ Observable', () => {
    it('should emit user changes', (done) => {
      const emissions: (User | null)[] = [];

      service.currentUser$.subscribe(user => {
        emissions.push(user);

        if (emissions.length === 3) {
          expect(emissions[0]).toBeNull();
          expect(emissions[1]).toEqual(mockUser);
          expect(emissions[2]).toBeNull();
          done();
        }
      });

      service['currentUserSubject'].next(mockUser);
      service['currentUserSubject'].next(null);
    });
  });
});
