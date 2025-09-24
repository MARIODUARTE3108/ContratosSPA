import React, { useEffect, useState } from 'react';
import * as blobServices from '../../services/blob-services';
import moment from 'moment';


export default function DetalharNoticia({ detalharNoticia }) {

    const [Noticia, setNoticia] = useState([]);

    console.log('aqui porra', detalharNoticia)
    const dadosNoticia = (id) => {
        blobServices.getNoticiaId(id)
            .then(result => {
                setNoticia(result);
            })
            .catch(e => { console.log(e) })
    }

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
      };
      

    useEffect(() => { dadosNoticia(detalharNoticia); }, [])

    return (
        <div className='row mb-3'>
            <div className='col-md-12'>
                <table className='mt-2' style={{ fontSize: '18px' }}>
                    <tbody>
                        <tr>
                            <th className='font-weight-bold'>Título da Notícia:</th>
                            <td className='pl-2'>{Noticia.titulo}</td>
                        </tr>
                        <tr>
                            <th className='font-weight-bold'>Descrição da Notícia:</th>
                            <td className='pl-2'>{Noticia.descricao}</td>
                        </tr>
                        <th className='font-weight-bold'></th>
                            <td className='pl-2'>{Noticia.imagem && <img src={Noticia.imagem} style={{ width: '450px' }} alt="Imagem" />}</td>
                        <tr>
                            <th className='font-weight-bold'>Capítulo da Notícia:</th>
                            <td className='pl-2'>{Noticia.chapeu}</td>
                        </tr>
                        <tr>
                            <th className='font-weight-bold'>Data da Publicação:</th>
                            <td className='pl-2'>{formatDate(Noticia.dataPublicacao)}</td>
                        </tr>
                        <tr>
                            <th className='font-weight-bold'>Autor da Notícia:</th>
                            <td className='pl-2'>{Noticia.autor}</td>
                        </tr>
                        <tr>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    )

}
