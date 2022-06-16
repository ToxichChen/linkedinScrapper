@extends('layouts.app')
@section('content')
    <form method="post" action="/created_queries/update/{{$createdQuery->id}}">
        @csrf
        <div class="form-group">
            <label for="company">Select company</label>
            <select class="form-control" id="company" name="company">
                @foreach($companies as $company)
                <option @if ($company->id == $createdQuery->company_id) selected @endif  value="{{$company->id}}">{{$company->company_name}}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="type">Select type of parsing</label>
            <select class="form-control" id="type" name="type">
                <option @if ('init' == $createdQuery->type_of_parsing) selected @endif value="init">Initial parsing</option>
                <option @if ('update' == $createdQuery->type_of_parsing) selected @endif value="update">Find new</option>
                <option @if ('past' == $createdQuery->type_of_parsing) selected @endif value="past">Find past employees</option>
            </select>
        </div>
        <div class="form-group">
            <input type="checkbox" class="form-check-input" name="is_parsed" id="is_parsed" @if ($createdQuery->is_parsed === 1) checked @endif>
            <label class="form-check-label" for="is_parsed">Is parsed</label>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
@endsection
