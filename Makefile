#makefile
install:
	npm ci

publish: 
	npm publish --dry-run

lint:
	npx eslint .

jest:
	npx jest 

test-coverage:
	npx jest --coverage
