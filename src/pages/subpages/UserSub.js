import React from 'react';
import { Divider, Segment, Button, Icon, Table, Menu, Label, Modal, Form, Select } from 'semantic-ui-react';
import swal from 'sweetalert';
import moment from 'moment';
import 'moment/locale/id';
import { User } from '../../services/requests';
import { inspect } from '../../services/utilities';
import Wait from '../../components/Wait';

export default class UserSub extends React.Component {

    state = {
        users: [],
        total: 0,
        limit: 20,
        offset: 0,
        curPage: 1,
        popupAdd: false,
        popupEdit: false,
        addType: '',
        editFields: {
            id: null,
            name: '',
            username: '',
            password: '',
            type: ''
        },
        loading: false,
        loadingText: ''
    }

    componentDidMount() {
        this._loadUserData();
    }

    _loadUserData() {
        let { limit, offset } = this.state;
        this._setLoading(true, 'Mengambil data pengguna..');
        User.index(limit, offset).then((res) => {
            this.setState({ users: res.data.rows, total: res.data.count }, () => this._setLoading(false));
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onAddPopup() {
        this.setState({ popupAdd: true });
    }

    _onEditPopup(user) {
        this.setState({ popupEdit: true, editFields: { ...user } });
    }

    _onSubmitAdd(e) {
        let { addType: type } = this.state;
        let data = inspect(e.target);
        data.type = type;
        this.setState({ popupAdd: false });
        this._setLoading(true, 'Menyimpan data..');
        User.save(data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil disimpan', 'success').then(this._loadUserData.bind(this));
            } else {
                swal('Error', 'Data gagal disimpan', 'error').then(this._loadUserData.bind(this));
            }
        });
        this.setState({
            addType: ''
        });
    }

    _onSubmitEdit() {
        let { editFields: data } = this.state;
        this.setState({ popupEdit: false });
        this._setLoading(true, 'Menupdate data..');
        User.edit(data.id, data).then((res) => {
            this._setLoading(false);
            if (res.status) {
                swal('Konfirmasi', 'Data berhasil diupdate', 'success').then(this._loadUserData.bind(this));
            } else {
                swal('Error', 'Data gagal diupdate', 'error').then(this._loadUserData.bind(this));
            }
        });
        this.setState({
            addType: '',
            editFields: {
                id: null,
                name: '',
                username: '',
                password: '',
                type: ''
            }
        });
    }

    _onDeleteUser(id) {
        swal({
            title: "Anda yakin?",
            text: "Anda akan menghapus pengguna ini",
            icon: "warning",
            buttons: [
                'Tidak',
                'Ya'
            ],
            dangerMode: true,
        }).then((isConfirm) => {
            if (isConfirm) {
                this._setLoading(true, 'Menghapus pengguna..');
                User.delete(id).then((res) => {
                    this._setLoading(false);
                    if (res.status) {
                        swal('Konfirmasi', 'Pengguna berhasil dihapus', 'success').then(this._loadUserData.bind(this));
                    } else {
                        swal('Error', 'Pengguna gagal disimpan', 'error').bind(this._loadUserData.bind(this));
                    }
                });
            }
        });
    }

    _switchPage(page) {
        this.setState({
            offset: this.state.limit * page,
            curPage: page + 1
        }, this._loadUserData.bind(this));
    }

    render() {
        const { users, total, limit, curPage, popupAdd, addType, popupEdit, editFields, loading, loadingText } = this.state;
        const { me } = this.props;
        const pageButtons = [];
        for (let i = 0; i < Math.ceil(total / limit); i++) {
            pageButtons.push(
                <Menu.Item active={i + 1 === curPage} as='a' key={i} onClick={() => this._switchPage(i)}>{i + 1}</Menu.Item>
            );
        }
        return (
            <div>
                {loading ? <Wait visible={true} text={loadingText} /> :
                    (
                        <div>
                            <Segment>
                                <Divider />
                                <h2>Manajemen Pengguna</h2>
                                <Divider />
                                <Button animated="vertical" color="green" onClick={this._onAddPopup.bind(this)}>
                                    <Button.Content hidden>Tambah</Button.Content>
                                    <Button.Content visible>
                                        <Icon name="plus" />
                                    </Button.Content>
                                </Button>
                                <Divider />
                                <Table celled>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Nama</Table.HeaderCell>
                                            <Table.HeaderCell>Bergabung</Table.HeaderCell>
                                            <Table.HeaderCell>Level</Table.HeaderCell>
                                            <Table.HeaderCell>Pilihan</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>

                                    <Table.Body>
                                        {(users.map((user, i) => (
                                            <Table.Row key={i}>
                                                <Table.Cell>{user.name}</Table.Cell>
                                                <Table.Cell>{moment(user.created_at).format('MMMM Do YYYY, h:mm:ss a')}</Table.Cell>
                                                <Table.Cell>
                                                    <Label ribbon={user.type === 'Administrator'} color={user.type === 'Administrator' ? 'orange' : 'grey'}>{user.type}</Label>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Button disabled={me.id === user.id} animated color="green" onClick={() => this._onEditPopup(user)} basic>
                                                        <Button.Content hidden>Edit</Button.Content>
                                                        <Button.Content visible>
                                                            <Icon name="edit" />
                                                        </Button.Content>
                                                    </Button>
                                                    <Button disabled={me.id === user.id} animated color="red" onClick={() => this._onDeleteUser(user.id)} basic>
                                                        <Button.Content hidden>Hapus</Button.Content>
                                                        <Button.Content visible>
                                                            <Icon name="trash" />
                                                        </Button.Content>
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        )))}
                                    </Table.Body>

                                    <Table.Footer>
                                        <Table.Row>
                                            <Table.HeaderCell colSpan='4'>
                                                {(pageButtons.length > 1) && (
                                                    <Menu floated='right' pagination>
                                                        <Menu.Item disabled={this.state.curPage === 1} onClick={() => {
                                                            this._switchPage(this.state.curPage - 1 - 1);
                                                        }} as='a' icon>
                                                            <Icon name='chevron left' />
                                                        </Menu.Item>
                                                        {pageButtons}
                                                        <Menu.Item disabled={this.state.curPage === Math.ceil(total / limit)} onClick={() => {
                                                            this._switchPage(this.state.curPage - 1 + 1);
                                                        }} as='a' icon>
                                                            <Icon name='chevron right' />
                                                        </Menu.Item>
                                                    </Menu>
                                                )}
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Footer>
                                </Table>
                            </Segment>

                            <Modal dimmer="blurring" open={popupAdd} onClose={() => this.setState({ popupAdd: false })} closeIcon>
                                <Modal.Header>Tambah Pengguna Baru</Modal.Header>
                                <Modal.Content>
                                    <Form method="post" onSubmit={this._onSubmitAdd.bind(this)}>
                                        <Form.Field>
                                            <label>Nama</label>
                                            <input required name="name" placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Username</label>
                                            <input required name="username" placeholder='Username' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Password</label>
                                            <input required name="password" type="password" placeholder='Password' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Level</label>
                                            <Select value={addType} required fluid onChange={(e, { value }) => this.setState({ addType: value })} placeholder="Level" options={[
                                                { key: 0, value: 'tenant', text: 'Administrator' },
                                                { key: 1, value: 'surveyor', text: 'Surveyor' }
                                            ]} />
                                        </Form.Field>
                                        <Divider />
                                        <Button type="submit">Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>

                            <Modal dimmer="blurring" open={popupEdit} onClose={() => this.setState({ popupEdit: false })} closeIcon>
                                <Modal.Header>Edit Pengguna</Modal.Header>
                                <Modal.Content>
                                    <Form method="post" onSubmit={this._onSubmitEdit.bind(this)}>
                                        <Form.Field>
                                            <label>Nama</label>
                                            <input required value={editFields.name} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.name = e.target.value;
                                                this.setState({ editFields });
                                            }} name="name" placeholder='Nama' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Username</label>
                                            <input required value={editFields.username} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.username = e.target.value;
                                                this.setState({ editFields });
                                            }} name="username" placeholder='Username' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Password</label>
                                            <input value={editFields.password} onChange={(e) => {
                                                let { editFields } = this.state;
                                                editFields.password = e.target.value;
                                                this.setState({ editFields });
                                            }} name="password" type="password" placeholder='Password (kosongkan jika tidak ingin merubah)' />
                                        </Form.Field>
                                        <Form.Field>
                                            <label>Level</label>
                                            <Select value={editFields.type} required fluid onChange={(e, { value }) => {
                                                let { editFields } = this.state;
                                                editFields.type = value;
                                                this.setState({ editFields });
                                            }} placeholder="Level" options={[
                                                { key: 0, value: 'tenant', text: 'Tenant' },
                                                { key: 1, value: 'surveyor', text: 'Surveyor' }
                                            ]} />
                                        </Form.Field>
                                        <Divider />
                                        <Button type="submit">Simpan</Button>
                                    </Form>
                                </Modal.Content>
                            </Modal>
                        </div>
                    )
                }
            </div>
        );
    }

}