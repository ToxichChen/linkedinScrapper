@extends('layouts.app')
@section('content')


    <table id="table_id" class="display">
        <thead>
        <tr>
            <th>Name</th>
            <th>Lastname</th>
            <th>LinkedIn URL</th>
            <th>Company</th>
            <th>Job</th>
            <th>Location</th>
            <th>Connections</th>
            <th>Active</th>
            <th>Sales Nav</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($accounts as $account)
            <tr>
                <td>{{$account->name}}</td>
                <td>{{$account->last_name}}</td>
                <td>{{$account->linkedinUrl}}</td>
                <td>{{$account->company}}</td>
                <td>{{$account->job}}</td>
                <td>{{$account->location}}</td>
                <td>{{$account->connections}}</td>
                <td>{{$account->active}}</td>
                <td>{{$account->has_sales_nav}}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <script>
        $(document).ready(function () {
            $('#table_id').DataTable();
        });
    </script>
@endsection
