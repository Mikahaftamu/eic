import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { MedicalItemEntity, MedicalItemType } from '../entities/medical-item.entity';
import { MedicalServiceEntity, ServiceType } from '../entities/medical-service.entity';
import { MedicalCategoryEntity } from '../entities/medical-category.entity';
import { CreateMedicalItemDto } from '../dto/create-medical-item.dto';
import { UpdateMedicalItemDto } from '../dto/update-medical-item.dto';
import { CreateMedicalServiceDto } from '../dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from '../dto/update-medical-service.dto';
import { CreateMedicalCategoryDto } from '../dto/create-medical-category.dto';
import { UpdateMedicalCategoryDto } from '../dto/update-medical-category.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class MedicalCatalogService {
  constructor(
    @InjectRepository(MedicalItemEntity)
    private medicalItemRepository: Repository<MedicalItemEntity>,
    @InjectRepository(MedicalServiceEntity)
    private medicalServiceRepository: Repository<MedicalServiceEntity>,
    @InjectRepository(MedicalCategoryEntity)
    private medicalCategoryRepository: Repository<MedicalCategoryEntity>,
  ) {}

  // Category Methods
  async createCategory(
    createCategoryDto: CreateMedicalCategoryDto,
  ): Promise<MedicalCategoryEntity> {
    const category = this.medicalCategoryRepository.create(createCategoryDto);
    return this.medicalCategoryRepository.save(category);
  }

  async findAllCategories(
    insuranceCompanyId: string,
    page = 1,
    limit = 10,
    search?: string,
    parentCategoryId?: string,
  ): Promise<PaginatedResponseDto<MedicalCategoryEntity>> {
    const where: FindOptionsWhere<MedicalCategoryEntity> = { 
      insuranceCompanyId,
      isActive: true,
    };

    if (parentCategoryId) {
      where.parentCategoryId = parentCategoryId;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [categories, total] = await this.medicalCategoryRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCategoryById(id: string): Promise<MedicalCategoryEntity> {
    const category = await this.medicalCategoryRepository.findOne({
      where: { id },
      relations: ['items', 'services'],
    });

    if (!category) {
      throw new NotFoundException(`Medical category with ID ${id} not found`);
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateMedicalCategoryDto,
  ): Promise<MedicalCategoryEntity> {
    const category = await this.findCategoryById(id);
    const updatedCategory = { ...category, ...updateCategoryDto };
    return this.medicalCategoryRepository.save(updatedCategory);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    await this.medicalCategoryRepository.remove(category);
  }

  // Medical Item Methods
  async createMedicalItem(
    createItemDto: CreateMedicalItemDto,
  ): Promise<MedicalItemEntity> {
    // Verify category exists
    await this.findCategoryById(createItemDto.categoryId);
    
    const item = this.medicalItemRepository.create(createItemDto);
    return this.medicalItemRepository.save(item);
  }

  async findAllMedicalItems(
    insuranceCompanyId: string,
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    type?: MedicalItemType,
    requiresPriorAuth?: boolean,
  ): Promise<PaginatedResponseDto<MedicalItemEntity>> {
    const where: FindOptionsWhere<MedicalItemEntity> = { 
      insuranceCompanyId,
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type;
    }

    if (requiresPriorAuth !== undefined) {
      where.requiresPriorAuth = requiresPriorAuth;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [items, total] = await this.medicalItemRepository.findAndCount({
      where,
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMedicalItemById(id: string): Promise<MedicalItemEntity> {
    const item = await this.medicalItemRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!item) {
      throw new NotFoundException(`Medical item with ID ${id} not found`);
    }

    return item;
  }

  async findMedicalItemByCode(code: string): Promise<MedicalItemEntity> {
    const item = await this.medicalItemRepository.findOne({
      where: { code },
      relations: ['category'],
    });

    if (!item) {
      throw new NotFoundException(`Medical item with code ${code} not found`);
    }

    return item;
  }

  async updateMedicalItem(
    id: string,
    updateItemDto: UpdateMedicalItemDto,
  ): Promise<MedicalItemEntity> {
    const item = await this.findMedicalItemById(id);
    
    // If category is being updated, verify it exists
    if (updateItemDto.categoryId) {
      await this.findCategoryById(updateItemDto.categoryId);
    }
    
    const updatedItem = { ...item, ...updateItemDto };
    return this.medicalItemRepository.save(updatedItem);
  }

  async removeMedicalItem(id: string): Promise<void> {
    const item = await this.findMedicalItemById(id);
    await this.medicalItemRepository.remove(item);
  }

  // Medical Service Methods
  async createMedicalService(
    createServiceDto: CreateMedicalServiceDto,
  ): Promise<MedicalServiceEntity> {
    // Verify category exists
    await this.findCategoryById(createServiceDto.categoryId);
    
    const service = this.medicalServiceRepository.create(createServiceDto);
    return this.medicalServiceRepository.save(service);
  }

  async findAllMedicalServices(
    insuranceCompanyId: string,
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    type?: ServiceType,
    requiresPriorAuth?: boolean,
  ): Promise<PaginatedResponseDto<MedicalServiceEntity>> {
    const where: FindOptionsWhere<MedicalServiceEntity> = { 
      insuranceCompanyId,
      isActive: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type;
    }

    if (requiresPriorAuth !== undefined) {
      where.requiresPriorAuth = requiresPriorAuth;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [services, total] = await this.medicalServiceRepository.findAndCount({
      where,
      relations: ['category'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data: services,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMedicalServiceById(id: string): Promise<MedicalServiceEntity> {
    const service = await this.medicalServiceRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(`Medical service with ID ${id} not found`);
    }

    return service;
  }

  async findMedicalServiceByCode(code: string): Promise<MedicalServiceEntity> {
    const service = await this.medicalServiceRepository.findOne({
      where: { code },
      relations: ['category'],
    });

    if (!service) {
      throw new NotFoundException(`Medical service with code ${code} not found`);
    }

    return service;
  }

  async updateMedicalService(
    id: string,
    updateServiceDto: UpdateMedicalServiceDto,
  ): Promise<MedicalServiceEntity> {
    const service = await this.findMedicalServiceById(id);
    
    // If category is being updated, verify it exists
    if (updateServiceDto.categoryId) {
      await this.findCategoryById(updateServiceDto.categoryId);
    }
    
    const updatedService = { ...service, ...updateServiceDto };
    return this.medicalServiceRepository.save(updatedService);
  }

  async removeMedicalService(id: string): Promise<void> {
    const service = await this.findMedicalServiceById(id);
    await this.medicalServiceRepository.remove(service);
  }
}
