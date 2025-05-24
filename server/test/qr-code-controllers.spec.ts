import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from '../src/tables/tables.controller';
import { TablesService } from '../src/tables/tables.service';
import { CustomerController } from '../src/customer/customer.controller';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

describe('QR Code Controllers', () => {
  let tablesController: TablesController;
  let customerController: CustomerController;
  let tablesService: TablesService;
  
  const mockTable = {
    id: 'test-table-id',
    name: 'Test Table 1',
    capacity: 4,
    status: 'AVAILABLE',
  };
  
  const mockQrCodeResponse = {
    qrCode: 'data:image/png;base64,iVBORw0KGgoAA...', // Mock base64 QR code image
    url: 'http://localhost:3000/customer/menu?tableId=test-table-id',
    table: {
      id: 'test-table-id',
      name: 'Test Table 1',
      capacity: 4
    }
  };
  
  const mockTablesService = {
    findOne: jest.fn(),
    generateQrCode: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController, CustomerController],
      providers: [
        {
          provide: TablesService,
          useValue: mockTablesService
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              return null;
            }),
          }
        }
      ],
    }).compile();

    tablesController = module.get<TablesController>(TablesController);
    customerController = module.get<CustomerController>(CustomerController);
    tablesService = module.get<TablesService>(TablesService);
  });

  describe('Tables Controller - QR Code Generation', () => {
    it('should generate a QR code for a valid table ID', async () => {
      mockTablesService.findOne.mockResolvedValue(mockTable);
      mockTablesService.generateQrCode.mockResolvedValue(mockQrCodeResponse);
      
      const result = await tablesController.generateQrCode('test-table-id');
      
      expect(result).toEqual(mockQrCodeResponse);
      expect(mockTablesService.findOne).toHaveBeenCalledWith('test-table-id');
      expect(mockTablesService.generateQrCode).toHaveBeenCalledWith('test-table-id');
    });
    
    it('should throw NotFoundException for non-existent table', async () => {
      mockTablesService.findOne.mockRejectedValue(new NotFoundException('Table not found'));
      
      await expect(tablesController.generateQrCode('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Customer Controller - QR Code Access', () => {
    it('should get table information for a customer', async () => {
      mockTablesService.findOne.mockResolvedValue(mockTable);
      
      const result = await customerController.getTable('test-table-id');
      
      expect(result).toEqual(mockTable);
      expect(mockTablesService.findOne).toHaveBeenCalledWith('test-table-id');
    });
    
    it('should get QR code for a table as a customer', async () => {
      mockTablesService.generateQrCode.mockResolvedValue(mockQrCodeResponse);
      
      const result = await customerController.getTableQrCode('test-table-id');
      
      expect(result).toEqual(mockQrCodeResponse);
      expect(mockTablesService.generateQrCode).toHaveBeenCalledWith('test-table-id');
    });
    
    it('should throw NotFoundException for non-existent table in customer endpoint', async () => {
      mockTablesService.findOne.mockRejectedValue(new NotFoundException('Table not found'));
      
      await expect(customerController.getTable('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
