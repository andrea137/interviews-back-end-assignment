import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { CategoryDto } from 'src/category/dto';
import * as pactum from 'pactum';
import { ProductDto } from 'src/product/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });

  describe('category', () => {
    describe('fetch all empty', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/category/fetchallcategories')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    const dto: CategoryDto = {
      name: 'TestCategory',
    };
    describe('add category', () => {
      it('should add', () => {
        return pactum
          .spec()
          .post('/category/addcategory')
          .withBody(dto)
          .expectStatus(201)
          .stores('categoryId', 'id');
      });

      it('should throw if name empty', () => {
        return pactum
          .spec()
          .post('/category/addcategory')
          .withBody({})
          .expectStatus(400);
      });
    });

    describe('fetch all categories', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/category/fetchallcategories')
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJson('0', {
            id: '$S{categoryId}',
            name: dto.name,
          });
      });
    });
  });

  describe('product', () => {
    describe('fetch all empty', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproducts')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    const dto: ProductDto = {
      name: 'Example Product Name',
      serialNo: 'AB456',
      imageURL: 'https://example.com/image.jpg',
      price: 19.99,
      quantity: 100,
      categoryId: 1,
    };

    describe('addproduct', () => {
      it('should add', () => {
        return pactum
          .spec()
          .post('/product/addproduct')
          .withBody({ ...dto, categoryId: '$S{categoryId}' })
          .expectStatus(201);
      });

      it('should throw if empty', () => {
        return pactum
          .spec()
          .post('/product/addproduct')
          .withBody({})
          .expectStatus(400);
      });
    });

    describe('fetch all products', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproducts')
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJsonLike('0', {
            serialNo: dto.serialNo,
            name: dto.name,
          });
      });
    });

    describe('add some product', () => {
      for (let i = 0; i < 5; i++) {
        // insert and test five times
        it(`should add product with serialNo iteration ${i}`, () => {
          const serialNoWithIteration = `AB456-${i}`; // change serialNo for each iteration
          return pactum
            .spec()
            .post('/product/addproduct')
            .withBody({
              ...dto,
              serialNo: serialNoWithIteration,
              categoryId: '$S{categoryId}',
            }) // use the modified serialNo
            .expectStatus(201);
        });
      }
    });

    describe('fetch all products cursor', () => {
      it('should fetch products without query params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .expectStatus(200)
          .expectJsonLength(6);
      });

      it('should fetch a limited number of products with only take param', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({ take: '2' })
          .expectStatus(200)
          .expectJsonLength(2)
          .stores('lastProductId', '[1].id');
      });

      it('should fech products with take and cursor params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '4',
            cursor: '$S{lastProductId}',
          })
          .expectStatus(200)
          .expectJsonLength(4)
          .expectJsonLike('3', {
            serialNo: 'AB456-4',
            name: dto.name,
          });
      });
    });

    describe('fetch 2 products without cursor', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({ take: 2 })
          .expectStatus(200)
          .expectJsonLength(2)
          .expectJsonLike('1', {
            serialNo: 'AB456-0',
            name: dto.name,
          });
      });
    });

    describe('add a second category', () => {
      it('should add', () => {
        return pactum
          .spec()
          .post('/category/addcategory')
          .withBody({ name: 'TestCategory2' })
          .expectStatus(201)
          .stores('categoryId2', 'id');
      });
    });

    describe('add some product', () => {
      for (let i = 0; i < 5; i++) {
        // insert and test five times
        it(`should add product with serialNo iteration ${i}`, () => {
          const serialNoWithIteration = `BC456-${i}`; // change serialNo for each iteration
          return pactum
            .spec()
            .post('/product/addproduct')
            .withBody({
              ...dto,
              serialNo: serialNoWithIteration,
              categoryId: '$S{categoryId2}',
            }) // use the modified serialNo and the new categoryId
            .expectStatus(201);
        });
      }
    });

    describe('fetch all products cursor of category', () => {
      it('should get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({ categoryId: '$S{categoryId2}' })
          .expectStatus(200)
          .expectJsonLength(5)
          .expectJsonLike('1', {
            serialNo: 'BC456-1',
            name: dto.name,
          });
      });
    });

    describe('fetch all products cursor with name', () => {
      it('should get with category and full name', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            productName: 'Example Product Name',
          })
          .expectStatus(200)
          .expectJsonLength(5)
          .expectJsonLike('1', {
            serialNo: 'BC456-1',
            name: dto.name,
          });
      });

      it('should get with complete name', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            productName: 'Example Product Name',
          })
          .expectStatus(200)
          .expectJsonLength(11)
          .expectJsonLike('10', {
            serialNo: 'BC456-4',
            name: dto.name,
          });
      });

      it('should get with partial name', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            productName: 'duct N',
          })
          .expectStatus(200)
          .expectJsonLength(5)
          .expectJsonLike('1', {
            serialNo: 'BC456-1',
            name: dto.name,
          });
      });

      it('should fetch a limited number of products with take, name, and category params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '2',
            categoryId: '$S{categoryId2}',
            productName: 'duct N',
          })
          .expectStatus(200)
          .expectJsonLength(2)
          .stores('lastProductId', '[1].id');
      });

      it('should fech products with take, cursor and name params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '3',
            cursor: '$S{lastProductId}',
            categoryId: '$S{categoryId2}',
            productName: 'duct N',
          })
          .expectStatus(200)
          .expectJsonLength(3)
          .expectJsonLike('2', {
            serialNo: 'BC456-4',
            name: dto.name,
          });
      });

      it('should not fech products with take, cursor and name params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '3',
            cursor: '$S{lastProductId}',
            categoryId: '$S{categoryId}',
          })
          .expectStatus(200)
          .expectBody([]);
      });

      it('should not get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            productName: 'Example Prodct Name',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('fetch all products cursor with name and serial', () => {
      it('should get with category and full name and serial', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            productName: dto.name,
            serialNo: 'BC456-1',
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJsonLike('0', {
            serialNo: 'BC456-1',
            name: dto.name,
          });
      });

      it('should get with complete serialNo', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            serialNo: 'BC456-4',
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .expectJsonLike('0', {
            serialNo: 'BC456-4',
            name: dto.name,
          });
      });

      it('should get with partial serialNo', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            serialNo: 'BC456-',
          })
          .expectStatus(200)
          .expectJsonLength(5)
          .expectJsonLike('1', {
            serialNo: 'BC456-1',
            name: dto.name,
          });
      });

      it('should fetch a limited number of products with take, name, and serialNo params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '2',
            categoryId: '$S{categoryId2}',
            serialNo: 'BC456-',
          })
          .expectStatus(200)
          .expectJsonLength(2)
          .stores('lastProductId', '[1].id');
      });

      it('should fech products with take, cursor and serialNo params', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            take: '3',
            cursor: '$S{lastProductId}',
            categoryId: '$S{categoryId2}',
            serialNo: 'BC',
          })
          .expectStatus(200)
          .expectJsonLength(3)
          .expectJsonLike('2', {
            serialNo: 'BC456-4',
            name: dto.name,
          });
      });

      it('should not fech products with name category and serialNo', async () => {
        await pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            name: 'Prod',
            serialNo: 'BC',
            categoryId: '$S{categoryId}',
          })
          .expectStatus(200)
          .expectBody([]);
      });

      it('should not get', () => {
        return pactum
          .spec()
          .get('/product/fetchallproductscursor')
          .withQueryParams({
            categoryId: '$S{categoryId2}',
            serialNo: 'BD456-4',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
