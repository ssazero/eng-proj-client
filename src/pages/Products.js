import React, { useState, useEffect } from 'react';

import Product from '../components/Product';
import Spinner from '../components/UI/Spinner/Spinner';
import Input from '../components/UI/SearchInput';
import Paginator from '../components/UI/Paginator';

const Products = (props) => {
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [requestTime, setRequestTime] = useState();
  const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     fetch('http://localhost:8100/products')
  //       .then((response) => {
  //         if (response.status !== 200) {
  //           throw new Error('Failed to fetch products.');
  //         }
  //         return response.json();
  //       })
  //       .then((data) => {
  //         const modifiedProducts = data.products.map((product) => {
  //           product.path = 'http://localhost:8101/' + product.path;
  //           return product;
  //         });
  //         setProducts(modifiedProducts);
  //         setLoading(false);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         setLoading(false);
  //       });
  //   }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const startTime = new Date().getTime();
      fetch('http://localhost:8100/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression: searchValue }),
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error('Failed to fetch products.');
          }
          return response.json();
        })
        .then((data) => {
          const modifiedProducts = data.products.map((product) => {
            product.path = 'http://localhost:8101/' + product.path;
            return product;
          });
          setRequestTime(new Date().getTime() - startTime);
          setTotalProducts(data.totalItems);
          setCurrentPage(1);
          setProducts(modifiedProducts);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }, 500);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue]);

  const fetchProducts = (direction) => {
    if (direction) {
      setProducts([]);
      setLoading(true);
    }
    let page = currentPage;
    if (direction === 'next') {
      page++;
      setCurrentPage(page);
    }
    if (direction === 'previous') {
      page--;
      setCurrentPage(page);
    }
    if (Number.isInteger(direction)) {
      page = direction;
      setCurrentPage(page);
    }
    fetch('http://localhost:8100/products?page=' + page, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expression: searchValue }),
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error('Failed to fetch products.');
        }
        return response.json();
      })
      .then((data) => {
        const modifiedProducts = data.products.map((product) => {
          product.path = 'http://localhost:8101/' + product.path;
          return product;
        });
        setTotalProducts(data.totalItems);
        setProducts(modifiedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const onChangeHandler = (event) => {
    event.preventDefault();
    setSearchValue(event.target.value);
  };

  let productList;

  if (loading) {
    productList = <Spinner />;
  } else if (products.length > 0) {
    productList = products.map((product) => (
      <Product
        key={product._id}
        title={product.title}
        category={product.category}
        company={product.company}
        reference={product.reference}
        description={product.description}
        src={product.path}
      />
    ));
  } else {
    productList = (
      <div className="products__not-found">
        Nie znaleziono produktu w bazie.
      </div>
    );
  }

  return (
    <section className="section-products">
      <Input
        id="products"
        label="Wyszukaj produkty oddzielając konkretne słowa spacją"
        placeholder="Np. mera lampa desk / ikea biurko"
        value={searchValue}
        onChange={onChangeHandler}
        totalProducts={totalProducts}
        requestTime={requestTime}
      />
      <div className="products">{productList}</div>
      {products.length > 0 && (
        <Paginator
          onPrevious={fetchProducts.bind(this, 'previous')}
          onNext={fetchProducts.bind(this, 'next')}
          onPage={fetchProducts}
          lastPage={Math.ceil(totalProducts / perPage)}
          currentPage={currentPage}
        />
      )}
    </section>
  );
};

export default Products;