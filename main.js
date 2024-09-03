
const Hapi = require('@hapi/hapi');
const num = 9000;
let books = [];
const local = 'localhost'
//var

const init = async () => {
    const server = Hapi.server({
        port: num,
        host: local
    });
// server

    const { nanoid } = await import('nanoid');

    server.route({
        method: 'POST',
        path: '/books',
        handler: (req, h) => {
            const { 
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading
            } = req.payload;

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku'
                }).code(400);
            }

            if (pageCount < readPage) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            const id = nanoid();
            const insertedAt = new Date().toISOString();
            const finished = pageCount === readPage;

            books.push({
                id,
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                finished,
                insertedAt,
                updatedAt: insertedAt,
            });

            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id
                }
            }).code(201);
        }
    });

    server.route({
        method: 'GET',
        path: '/books',
        handler: async (req, h) => {
            const {
                name,
                reading,
                finished
            } = req.query;

            let filteredBooks = [...books];

            if (name) {
                filteredBooks = filteredBooks.filter(book => book.name.toLowerCase().includes(name.toLowerCase()));
            }

            if (reading) {
                filteredBooks = filteredBooks.filter(book => book.reading === (reading === '1'));
            }

            if (finished) {
                filteredBooks = filteredBooks.filter(book => book.finished === (finished === '1'));
            }

            return h.response({
                status: 'success',
                data: {
                    books: filteredBooks.map(book => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher
                    }))
                }
            }).code(200);
        }
    });

    server.route({
        method: 'GET',
        path: '/books/{id}',
        handler: async (req, h) => {
            const { id } = req.params;
            let book = books.find(b => b.id === id);

            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan'
                }).code(404);
            }

            return h.response({
                status: 'success',
                data: { book }
            }).code(200);
        }
    });

    server.route({
        method: 'PUT',
        path: '/books/{id}',
        handler: async (req, h) => {
            const { id } = req.params;
            const { 
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading
            } = req.payload;
            let bookInd = books.findIndex(b => b.id === id);

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku'
                }).code(400);
            }
            
            if (bookInd === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan'
                }).code(404);
            }

            
            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            const updatedAt = new Date().toISOString();
            const finished = readPage === pageCount;

            books[bookInd] = {
                ...books[bookInd],
                name,
                year,
                author,
                summary,
                publisher,
                pageCount,
                readPage,
                reading,
                finished,
                updatedAt};

            return h.response({
                status: 'success',
                message: 'Buku berhasil diperbarui'
            }).code(200);
        }
    });

    server.route({
        method: 'DELETE',
        path: '/books/{id}',
        handler: async (req, h) => {
            const { id } = req.params;
            let bookInd = books.findIndex(b => b.id === id);

            if (bookInd === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan'
                }).code(404);
            } else {

            books.splice(bookInd, 1);
            
            return h.response({
                status: 'success',
                message: 'Buku berhasil dihapus'
            }).code(200);
        }
        }
    });

    await server.start();
    console.log(`Server is running on port: http://localhost:9000`);
};

process.on('Missed error', (err) => {
    console.log(err);
    process.exit(1);
});

init();
