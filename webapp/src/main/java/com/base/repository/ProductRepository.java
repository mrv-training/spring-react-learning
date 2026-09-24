package com.base.repository;

import com.base.entity.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
	boolean existsBySku(String sku);

	boolean existsBySkuAndIdNot(String sku, Long id);

	boolean existsByCategoryId(Long categoryId);

	long countByCategoryId(Long categoryId);

	@Query("""
			select p from ProductEntity p
			join p.category c
			where :q is null or :q = ''
			or lower(p.name) like lower(concat('%', :q, '%'))
			or lower(p.sku) like lower(concat('%', :q, '%'))
			or lower(c.name) like lower(concat('%', :q, '%'))
			or lower(coalesce(p.description, '')) like lower(concat('%', :q, '%'))
			""")
	Page<ProductEntity> search(@Param("q") String q, Pageable pageable);
}
