import { useState, useEffect } from 'react'
import moment from 'moment';
import uuid from 'react-uuid';

// customhooks
import { Dock, useDocks } from './customHooks';

// utils
import { FormData } from './utils';

// assests
import './App.css';
import { PlusOutlined } from '@ant-design/icons';
import { DeleteOutlined, FormOutlined } from '@ant-design/icons';

// components
import { ColumnsType } from 'antd/es/table';
import { Table, Button, Modal, Form, Input, Checkbox, DatePicker, message, Popconfirm } from 'antd';

function App() {
  const { TextArea } = Input;
  const [ form ] = Form.useForm();
  const { docks, setDocks, isLoading } = useDocks()
  const [edit, setEdit] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('');

  const columns: ColumnsType<Dock> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Dock, b: Dock) => a.name.localeCompare(b.name)
    },
    {
      title: 'Acoplamiento cruzado',
      dataIndex: 'hasCrossDocking',
      key: 'hasCrossDocking',
      render: (hasCrossDocking: boolean) => (hasCrossDocking ? 'Si' : 'No')
    },
    {
      title: 'Fecha',
      key: 'lastSchedulingDate',
      dataIndex: 'lastSchedulingDate',
      render: (text) => <span>{FormData(text)}</span>,
      sorter: (a: Dock, b: Dock) => new Date(a.lastSchedulingDate).getTime() - new Date(b.lastSchedulingDate).getTime()
    },
    {
      title: 'Descripciòn',
      key: 'description',
      dataIndex: 'description',
    },
    {
        title: 'Acciones',
        key: 'actions',
        render: (item: Dock) => Actions(item),
    },
  ];

  const Actions = (item: Dock) => {
    const confirm = (item: Dock) => {
        const findIndex = docks.findIndex(e => e.id === item.id)
        if(findIndex !== -1) {
            const updateDocks = [...docks]
            updateDocks.splice(findIndex, 1)
            const localDocks = JSON.stringify(updateDocks)
            localStorage.setItem('docks', localDocks)
            setDocks(updateDocks)
            message.success(`¡Se elimino corrctamente ${item.name}!`);
        }
    };
    const cancel = (item: Dock) => {
        message.error(`¡Se cancelo la operacion de eliminar ${item.name}!`);
    };
    return (
        <div style={{ display: 'flex', gap: '.5em' }}>
            <FormOutlined style={{ fontSize: '1.5em' }} onClick={() => {setIsModalOpen(true); setEdit(item.id)}} />
            <Popconfirm
                placement='top'
                title={`Se eliminara ${item.name}`}
                description='¿Estas seguro de eliminar?'
                onConfirm={() => confirm(item)}
                onCancel={() => cancel(item)}
                okText='Si'
                cancelText='No'
            >
              <DeleteOutlined style={{ fontSize: '1.5em' }} />
            </Popconfirm>
        </div>
    )
  }

  const filteredData = docks.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOk = () => {
    form.validateFields()
    .then((values) => {
      const randomUuid = uuid()
      const addDock = {
        id: values.id ? values.id : randomUuid,
        name: values.name,
        description: values.description,
        lastSchedulingDate: values.date,
        hasCrossDocking: values.hasCrossDocking
      }
      if(edit) {
        const find = docks.map(e => e.id === edit ? addDock : e)
        localStorage.setItem('docks', JSON.stringify(find))
        setDocks(find)
        form.resetFields()
        setIsModalOpen(false);
        message.success(`¡Se actualizo correctamente ${values.name}!`);
      } else {
        const localDocks = [...docks, addDock] 
        localStorage.setItem('docks', JSON.stringify(localDocks))
        setDocks(localDocks)
        form.resetFields()
        setIsModalOpen(false);
        message.success(`¡Se guardo correctamente ${values.name}!`);
      }
      setEdit('')
    })
    .catch((error) => {
      console.log('error', error)
    })
  };

  const handleCancel = () => {
    form.resetFields()
    setEdit('')
    setIsModalOpen(false);
  };

  useEffect(() => {
    if(edit) {
      const find = docks.find(e => e.id === edit)
      if(find) {
        form.setFieldsValue({
          id: find.id,
          name: find.name,
          description: find.description,
          date: moment(find.lastSchedulingDate),
          hasCrossDocking: find.hasCrossDocking
        });
      }
    }
  }, [edit])
  
  return (
    <div className="container">
      <div className='container_header'>
        <h1 className='title_header'>Solicitudes de información</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Input.Search
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type='primary' size='large' shape='round' icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Agregar</Button>
        </div>
      </div>
      <Table rowKey='id' columns={columns} dataSource={filteredData} loading={isLoading} bordered className='container_table' locale={{ emptyText: 'No se encontro información' }} />
      <Modal title={edit ? 'Actualizar un Dock' : 'Agrega un nuevo Dock'} open={isModalOpen} okText={edit ? 'Actualizar' : 'Crear'} onOk={handleOk} onCancel={handleCancel} maskClosable={false} closable={false}>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          autoComplete="off"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          form={form}
        >
          <Form.Item name='name' label='Nombre' rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='date' label="Fecha" rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name='description' label="Descripción" rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name='hasCrossDocking' valuePropName='checked'>
            <Checkbox>Acoplamiento cruzado</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default App;
