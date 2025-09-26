# 🤝 Contributing to Restaurant Management System

Cảm ơn bạn đã quan tâm đến việc đóng góp cho Restaurant Management System! Chúng tôi chào đón mọi đóng góp từ cộng đồng.

## 📋 Mục lục

- [Code of Conduct](#code-of-conduct)
- [Cách đóng góp](#cách-đóng-góp)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

Dự án này tuân thủ Contributor Covenant Code of Conduct. Bằng việc tham gia, bạn đồng ý tuân theo các quy tắc này.

### Hành vi được khuyến khích:
- Sử dụng ngôn ngữ chào đón và bao dung
- Tôn trọng quan điểm và kinh nghiệm khác nhau
- Chấp nhận phản hồi xây dựng một cách lịch thiệp
- Tập trung vào điều tốt nhất cho cộng đồng

### Hành vi không được chấp nhận:
- Ngôn ngữ hoặc hình ảnh khiêu dâm
- Bình luận xúc phạm hoặc miệt thị
- Quấy rối công khai hoặc riêng tư
- Xuất bản thông tin riêng tư của người khác

## 🚀 Cách đóng góp

### 🐛 Báo cáo lỗi

1. **Kiểm tra Issues hiện có** - Đảm bảo lỗi chưa được báo cáo
2. **Tạo Issue mới** với template Bug Report
3. **Mô tả chi tiết**:
   - Môi trường (OS, Browser, Node.js version)
   - Các bước để tái tạo lỗi
   - Kết quả mong đợi vs thực tế
   - Screenshots nếu có thể

### ✨ Đề xuất tính năng

1. **Kiểm tra Issues** - Tính năng có thể đã được đề xuất
2. **Tạo Feature Request** với template phù hợp
3. **Mô tả rõ ràng**:
   - Vấn đề tính năng giải quyết
   - Giải pháp đề xuất
   - Các phương án thay thế đã cân nhắc

### 💻 Đóng góp code

1. **Fork repository**
2. **Tạo feature branch** từ `main`
3. **Implement changes** theo coding standards
4. **Viết tests** cho code mới
5. **Commit với message rõ ràng**
6. **Tạo Pull Request**

## 🛠️ Development Setup

### Yêu cầu hệ thống
- Node.js v18+
- PostgreSQL v14+
- Git

### Cài đặt local development

```bash
# 1. Fork và clone repository
git clone https://github.com/your-username/Restaurant-Management.git
cd Restaurant-Management

# 2. Cài đặt backend
cd server
npm install --legacy-peer-deps
cp .env.example .env
# Cấu hình database trong .env

# 3. Cài đặt frontend  
cd ../client
npm install
cp .env.local.example .env.local

# 4. Khởi động development
# Terminal 1: Backend
cd server && npm run start:dev

# Terminal 2: Frontend
cd client && npm run dev
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/feature-name` - Feature development
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical production fixes

### Commit Message Format

```
type(scope): description

body (optional)

footer (optional)
```

**Types:**
- `feat` - Tính năng mới
- `fix` - Sửa lỗi
- `docs` - Thay đổi documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Build process, auxiliary tools

**Examples:**
```bash
git commit -m "feat(auth): add JWT refresh token functionality"
git commit -m "fix(orders): resolve null pointer exception in order processing"
git commit -m "docs(readme): update installation instructions"
```

## 📏 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
interface UserData {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

const createUser = async (userData: CreateUserDto): Promise<User> => {
  // Function implementation
};

// ❌ Bad
const createUser = async (data: any) => {
  // No type safety
};
```

### NestJS Backend Standards

```typescript
// ✅ Controller example
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: GetUsersDto): Promise<User[]> {
    return this.usersService.findAll(query);
  }
}

// ✅ Service example
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: GetUsersDto): Promise<User[]> {
    // Implementation with proper error handling
  }
}
```

### React/Next.js Frontend Standards

```tsx
// ✅ Component example
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      {/* Rest of component */}
    </div>
  );
};
```

### CSS/Styling Standards

```tsx
// ✅ TailwindCSS classes - ordered by type
<div className="flex flex-col items-center justify-center w-full h-screen bg-gray-100 p-4">
  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
    {/* Content */}
  </div>
</div>

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

## 🧪 Testing Guidelines

### Backend Tests

```typescript
// Unit test example
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create a user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    const expectedUser = { id: '1', ...userData };

    jest.spyOn(repository, 'save').mockResolvedValue(expectedUser as User);

    const result = await service.create(userData);
    expect(result).toEqual(expectedUser);
  });
});
```

### Frontend Tests

```tsx
// Component test example  
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('should render user information', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={mockOnEdit} onDelete={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

### Test Commands

```bash
# Backend tests
cd server
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests  
npm run test:cov      # Coverage report

# Frontend tests  
cd client
npm run test          # Jest tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📝 Pull Request Process

### Before Creating PR

1. **Sync với main branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run tests và linting**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. **Build successfully**
   ```bash
   npm run build
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass  
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### Review Process

1. **Automated checks** phải pass
2. **Code review** từ maintainers
3. **Testing** trên staging environment
4. **Approval** từ ít nhất 1 maintainer
5. **Merge** vào main branch

## 🐛 Issue Guidelines

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Ubuntu]
 - Browser [e.g. chrome, safari]
 - Node.js version [e.g. 18.17.0]
 - Package version [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🏷️ Labels

### Bug Labels
- `bug` - Something isn't working
- `critical` - Critical bug that needs immediate attention
- `security` - Security-related issue

### Feature Labels  
- `enhancement` - New feature or request
- `feature` - New feature implementation
- `improvement` - Enhancement to existing feature

### Priority Labels
- `priority: high` - High priority
- `priority: medium` - Medium priority  
- `priority: low` - Low priority

### Status Labels
- `status: in-progress` - Currently being worked on
- `status: review-needed` - Needs review
- `status: blocked` - Blocked by other issues

## 🎯 Development Tips

### Performance Best Practices

```typescript
// ✅ Database queries - Use pagination
async findAll(query: GetUsersDto): Promise<PaginatedResult<User>> {
  const [data, total] = await this.userRepository.findAndCount({
    take: query.limit || 10,
    skip: (query.page - 1) * (query.limit || 10),
  });

  return {
    data,
    total,
    page: query.page,
    totalPages: Math.ceil(total / (query.limit || 10)),
  };
}

// ✅ Frontend - Memoization
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return processLargeDataset(data);
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});
```

### Security Best Practices

```typescript
// ✅ Input validation
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  // DTO automatically validates input
  return this.usersService.create(createUserDto);
}

// ✅ Password hashing
async hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// ✅ JWT handling
@UseGuards(JwtAuthGuard)
async getProfile(@Request() req) {
  return req.user;
}
```

## 📞 Liên hệ

- **GitHub Issues**: [Create an issue](https://github.com/hoanghust2003/Restaurant-Management/issues)
- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **Discussions**: [GitHub Discussions](https://github.com/hoanghust2003/Restaurant-Management/discussions)

## 🙏 Cảm ơn

Cảm ơn tất cả contributors đã giúp làm cho Restaurant Management System tốt hơn!

<div align="center">

**⭐ Đừng quên star repository nếu bạn thấy hữu ích!**

</div>